import { pop } from './queue'
import { exec } from 'child_process'
import { createAsyncThunk } from '@reduxjs/toolkit'
import { promisify } from 'util'
import { QueueNode } from '../containers/Queue'

const PSC_FINISHED = '__PSC_FINISHED'
const prExec = promisify(exec)

export type Preview = {
  name: string
  description: string
}

export const checkUpdates = createAsyncThunk('@apt/CHECK_UPDATES', async (_, thunkAPI) => {
  const { stdout, stderr } = await prExec(
    'apt-get -s -o Debug::NoLocking=true upgrade | grep ^Inst | cut -c 6-'
  )
  if (stderr) return thunkAPI.rejectWithValue(stderr)
  return stdout.split('\n').length - 1
})

export const process = createAsyncThunk('@apt/PROCESS', async (packages: QueueNode[], thunkAPI) => {
  try {
    const prepared = packages
      .map(({ flag, name }: QueueNode) => `apt ${flag} -y ${name}; echo ${PSC_FINISHED}`)
      .join(';')
    const { stdout, stderr } = exec(`pkexec sh -c "${prepared}"`)
    if (!stdout || !stderr) return thunkAPI.rejectWithValue(new Error('Failed to host shell'))

    stderr.on('data', chunk => {
      const line = chunk as string
      thunkAPI.rejectWithValue(line)
    })

    for await (const chunk of stdout) {
      const line = chunk as string
      console.log(line)
      if (line.match(PSC_FINISHED)) thunkAPI.dispatch(pop())
    }
    return
  } catch (e) {
    return thunkAPI.rejectWithValue(e)
  }
})
export const status = createAsyncThunk('@apt/STATUS', async (packageName: string) => {
  try {
    const { stdout, stderr } = await prExec(`dpkg-query -W ${packageName}`)
    return stdout.length !== 0 || stderr.length === 0
  } catch (e) {
    return false
  }
})
export const searchPreviews = createAsyncThunk(
  '@apt/SEARCH_PREVIEWS',
  async (packageName: string, thunkAPI) => {
    try {
      const { stdout, stderr } = await prExec(`apt-cache search --names-only ${packageName}`)
      if (stderr) {
        return thunkAPI.rejectWithValue(stderr)
      }
      const names = stdout.split('\n')
      return names.slice(0, names.length - 1).map(str => {
        const res = str.split(/ - /)
        const preview: Preview = {
          name: res[0],
          description: res[1]
        }
        return preview
      })
    } catch (e) {
      return thunkAPI.rejectWithValue(e)
    }
  }
)
export const search = createAsyncThunk('@apt/SEARCH', async (packageName: string, thunkAPI) => {
  try {
    const { stdout, stderr } = await prExec(`apt-cache show ${packageName}`)
    if (stderr) {
      return thunkAPI.rejectWithValue(stderr)
    }
    return stdout
  } catch (e) {
    return thunkAPI.rejectWithValue(e)
  }
})
