// import { useWallet } from '@txnlab/use-wallet-react'
// import { useSnackbar } from 'notistack'
// import { useEffect, useState } from 'react'
// import { CounterClient } from '../contracts/Counter'
// import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
// import { AlgorandClient } from '@algorandfoundation/algokit-utils'

// interface AppCallsInterface {
//   openModal: boolean
//   setModalState: (value: boolean) => void
//   appId:1003
// }

// const AppCalls = ({ openModal, setModalState, appId }: AppCallsInterface) => {
//   const [loading, setLoading] = useState<boolean>(false)
//   // Fixed deployed application ID so users don't need to deploy repeatedly
//   const FIXED_APP_ID = 747652603
//   const [appId, setAppId] = useState<number | null>(FIXED_APP_ID)
//   const [currentCount, setCurrentCount] = useState<number>(0)
//   const { enqueueSnackbar } = useSnackbar()
//   const { activeAccount, activeAddress, transactionSigner: TransactionSigner } = useWallet()

//   const algodConfig = getAlgodConfigFromViteEnvironment()
//   const indexerConfig = getIndexerConfigFromViteEnvironment()
//   const algorand = AlgorandClient.fromConfig({
//     algodConfig,
//     indexerConfig,
//   })
  
  
//   algorand.setDefaultSigner(TransactionSigner)

//   // Separate function to fetch current count
//   const fetchCount = async (appId: number): Promise<number> => {
//     try {
//       const counterClient = new CounterClient({
//         appId: BigInt(appId),
//         algorand,
//         defaultSigner: TransactionSigner,
//       })
//       const state = await counterClient.appClient.getGlobalState()
//       return typeof state.count.value === 'bigint' 
//         ? Number(state.count.value) 
//         : parseInt(state.count.value, 10)
//     } catch (e) {
//       enqueueSnackbar(`Error fetching count: ${(e as Error).message}`, { variant: 'error' })
//       return 0
//     }
//   }

//   // Deploy function kept for future use; commented out per request
//   // const [deploying, setDeploying] = useState<boolean>(false)
//   // const deployContract = async () => {
//   //   setDeploying(true)
//   //   try {
//   //     const factory = new CounterFactory({
//   //       defaultSender: activeAddress ?? undefined,
//   //       algorand,
//   //     })
//   //     // Deploy multiple addresses with the same contract
//   //     const deployResult = await factory.send.create.bare()
//   //     // If you want idempotent deploy from one address
//   //     // const deployResult = await factory.deploy({
//   //     //   onSchemaBreak: OnSchemaBreak.AppendApp,
//   //     //   onUpdate: OnUpdate.AppendApp,
//   //     // })
//   //     const deployedAppId = Number(deployResult.appClient.appId)
//   //     setAppId(deployedAppId)
//   //     const count = await fetchCount(deployedAppId)
//   //     setCurrentCount(count)
//   //     enqueueSnackbar(`Contract deployed with App ID: ${deployedAppId}. Initial count: ${count}`, { variant: 'success' })
//   //   } catch (e) {
//   //     enqueueSnackbar(`Error deploying contract: ${(e as Error).message}`, { variant: 'error' })
//   //   } finally {
//   //     setDeploying(false)
//   //   }
//   // }

//   // Auto-load current count for the fixed app ID
//   useEffect(() => {
//     const load = async () => {
//       if (appId) {
//         const count = await fetchCount(appId)
//         setCurrentCount(count)
//       }
//     }
//     void load()
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [appId, TransactionSigner])

//   const incrementCounter = async () => {
//     if (!appId) {
//       enqueueSnackbar('Missing App ID', { variant: 'error' })
//       return
//     }

//     setLoading(true)
//     try {
//       const counterClient = new CounterClient({
//         appId: BigInt(appId),
//         algorand,
//         defaultSigner: TransactionSigner,
//       })

//       // Increment the counter
//       await counterClient.send.incrCounter({args: [], sender: activeAddress ?? undefined})
      
//       // Fetch and set updated count
//       const count = await fetchCount(appId)
//       setCurrentCount(count)
      
//       enqueueSnackbar(`Counter incremented! New count: ${count}`, { 
//         variant: 'success' 
//       })
//     } catch (e) {
//       enqueueSnackbar(`Error incrementing counter: ${(e as Error).message}`, { variant: 'error' })
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <dialog id="appcalls_modal" className={`modal ${openModal ? 'modal-open' : ''} bg-slate-200`}>
//       <form method="dialog" className="modal-box">
//         <h3 className="font-bold text-lg">Counter Contract</h3>
//         <br />
        
//         <div className="flex flex-col gap-4">
//           {appId && (
//             <div className="alert alert-info flex flex-col gap-1">
//               <span>Current App ID: {appId}</span>
//               <span>Current Count: {currentCount}</span>
//             </div>
//           )}
          
//           {/*
//           <div className="flex flex-col gap-2">
//             <button 
//               className={`btn btn-primary ${deploying ? 'loading' : ''}`}
//               onClick={deployContract}
//               disabled={deploying || loading}
//             >
//               {deploying ? 'Deploying...' : 'Deploy Contract'}
//             </button>
//             <p className="text-sm">Run this once to deploy the contract</p>
//           </div>
          
//           <div className="divider">OR</div>
//           */}
          
//           <div className="flex flex-col gap-2">
//             <button 
//               className={`btn btn-secondary ${loading ? 'loading' : ''}`}
//               onClick={incrementCounter}
//               disabled={loading || !appId}
//             >
//               {loading ? 'Processing...' : 'Increment Counter'}
//             </button>
//             <p className="text-sm">Requires deployed contract</p>
//           </div>
          
//           <div className="modal-action">
//             <button 
//               className="btn" 
//               onClick={() => setModalState(false)}
//               disabled={loading}
//             >
//               Close
//             </button>
//           </div>
//         </div>
//       </form>
//     </dialog>
//   )
// }

// export default AppCalls


import { useWallet } from '@txnlab/use-wallet-react'
import { useSnackbar } from 'notistack'
import { useEffect, useState, useMemo } from 'react'
import { ClubVotingClient } from '../contracts/ClubVotingClient'
import { getAlgodConfigFromViteEnvironment, getIndexerConfigFromViteEnvironment } from '../utils/network/getAlgoClientConfigs'
import { AlgorandClient } from '@algorandfoundation/algokit-utils'

interface AppCallsInterface {
  openModal: boolean
  setModalState: (value: boolean) => void
  appId: number
}

const AppCalls = ({ openModal, setModalState, appId }: AppCallsInterface) => {
  const [loading, setLoading] = useState<boolean>(false)
  const [presidentVotes, setPresidentVotes] = useState<number>(0)
  const [secretaryVotes, setSecretaryVotes] = useState<number>(0)
  const [inputName, setInputName] = useState('')
  const [inputRole, setInputRole] = useState<'President' | 'Secretary'>('President')

  const { enqueueSnackbar } = useSnackbar()
  const { activeAddress, transactionSigner } = useWallet()

  // 1. Setup Algorand Client
  const algorand = useMemo(() => {
    const config = getAlgodConfigFromViteEnvironment()
    const client = AlgorandClient.fromConfig({ 
      algodConfig: config, 
      indexerConfig: getIndexerConfigFromViteEnvironment() 
    })
    if (transactionSigner) client.setDefaultSigner(transactionSigner)
    return client
  }, [transactionSigner])

  // 2. Setup Smart Contract Client
  const client = new ClubVotingClient({
    appId: BigInt(appId),
    algorand,
  })

  // 3. ADMIN PROFILE LOGIC: Register Candidates
const adminAddCandidate = async () => {
  if (!activeAddress) return
  setLoading(true)
  try {
    // We create a payment transaction for the Minimum Balance Requirement (MBR)
    const mbrPayment = await algorand.transactions.payment({
      sender: activeAddress,
      receiver: client.appClient.appAddress,
      amount: (2500 + (400 * (inputName.length + 8))) as any, // Standard Box MBR calculation
    })

    await client.send.addCandidate({
      args: { name: inputName, position: inputRole },
      sender: activeAddress,
      extraFee: 1000, // Optional: covers extra box access costs
    })
    
    enqueueSnackbar(`${inputName} added!`, { variant: 'success' })
    setInputName('')
  } catch (e) {
    console.error(e)
    enqueueSnackbar('Error: Ensure you are Admin and have ALGO for storage.', { variant: 'error' })
  }
  setLoading(false)
}
  // 4. STUDENT PROFILE LOGIC: Cast Votes
  const castVote = async (name: string, role: string) => {
    if (!activeAddress) {
      enqueueSnackbar('Please connect your wallet first', { variant: 'error' })
      return
    }
    setLoading(true)
    try {
      // Calls the single 'vote' method with name and position strings
      await client.send.vote({
        args: { name, position: role },
        sender: activeAddress,
      })
      enqueueSnackbar(`Vote cast for ${name}!`, { variant: 'success' })
      setTimeout(fetchVotes, 1000) // Refresh display
    } catch (e) {
      enqueueSnackbar('Voting failed. Make sure candidate exists.', { variant: 'error' })
    }
    setLoading(false)
  }
const fetchVotes = async () => {
  if (!appId || appId === 0) return
  try {
    const pBox = await client.appClient.getBoxValue({ name: 'Alice' })
    const sBox = await client.appClient.getBoxValue({ name: 'Bob' })
    
    // ✅ Fix: Use the correct decoding logic for uint64 boxes
    const decode = (data: Uint8Array) => {
      const view = new DataView(data.buffer)
      return Number(view.getBigUint64(0))
    }

    if (pBox) setPresidentVotes(decode(pBox))
    if (sBox) setSecretaryVotes(decode(sBox))
  } catch (e) {
    console.log("No initial box data found for Alice/Bob yet.")
  }
}

  useEffect(() => {
    if (openModal && appId > 0) fetchVotes()
  }, [openModal, appId])

  return (
    <dialog id="appcalls_modal" className={`modal ${openModal ? 'modal-open' : ''}`}>
      <div className="modal-box bg-white text-slate-800 border-2 border-slate-200">
        <h3 className="font-bold text-2xl text-center mb-4">Club Election</h3>
        
        <div className="flex flex-col gap-6">
          {/* --- ADMIN SECTION --- */}
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <h4 className="text-sm font-bold uppercase text-amber-600 mb-3">Admin: Register Candidates</h4>
            <div className="flex flex-col gap-2">
              <input 
                value={inputName} 
                onChange={(e) => setInputName(e.target.value)} 
                placeholder="Candidate Name" 
                className="input input-bordered w-full bg-white text-black"
              />
              <div className="flex gap-2">
                <select 
                  value={inputRole}
                  onChange={(e) => setInputRole(e.target.value as any)} 
                  className="select select-bordered flex-1 bg-white text-black"
                >
                  <option value="President">President</option>
                  <option value="Secretary">Secretary</option>
                </select>
                <button onClick={adminAddCandidate} className="btn btn-warning flex-1" disabled={loading}>
                  {loading ? 'Processing...' : 'Add to Ballot'}
                </button>
              </div>
            </div>
          </div>

          {/* --- RESULTS SECTION --- */}
          <div className="stats shadow bg-slate-100 w-full text-center">
            <div className="stat">
              <div className="stat-title text-blue-600 font-bold">Alice (P)</div>
              <div className="stat-value text-blue-600 text-2xl">{presidentVotes}</div>
            </div>
            <div className="stat">
              <div className="stat-title text-pink-600 font-bold">Bob (S)</div>
              <div className="stat-value text-pink-600 text-2xl">{secretaryVotes}</div>
            </div>
          </div>
          
          {/* --- STUDENT VOTING SECTION --- */}
          <div className="flex flex-col gap-3">
            <p className="text-xs text-center text-slate-400 italic">Cast your student vote:</p>
            <button className="btn btn-primary w-full" onClick={() => castVote('Alice', 'President')} disabled={loading}>
              Vote for Alice (President)
            </button>
            <button className="btn btn-secondary w-full" onClick={() => castVote('Bob', 'Secretary')} disabled={loading}>
              Vote for Bob (Secretary)
            </button>
          </div>
          
          <div className="modal-action">
            <button className="btn btn-ghost text-black" onClick={() => setModalState(false)}>Close</button>
          </div>
        </div>
      </div>
    </dialog>
  )
}

export default AppCalls