import { useState, useCallback } from 'react'

/**
 * useConfirm – lightweight confirm-dialog state hook.
 *
 * Usage:
 *   const { confirmState, requestConfirm, handleConfirm, handleCancel } = useConfirm()
 *   // trigger:
 *   requestConfirm({ title, message, onConfirm: () => deleteEntry(id) })
 *   // render:
 *   <ConfirmDialog {...confirmState} onConfirm={handleConfirm} onCancel={handleCancel} />
 */
export function useConfirm() {
  const [confirmState, setConfirmState] = useState({
    isOpen:    false,
    title:     '',
    message:   '',
    onConfirm: null,
  })

  const requestConfirm = useCallback(({ title, message, onConfirm }) => {
    setConfirmState({ isOpen: true, title, message, onConfirm })
  }, [])

  const handleConfirm = useCallback(() => {
    confirmState.onConfirm?.()
    setConfirmState((s) => ({ ...s, isOpen: false, onConfirm: null }))
  }, [confirmState])

  const handleCancel = useCallback(() => {
    setConfirmState((s) => ({ ...s, isOpen: false, onConfirm: null }))
  }, [])

  return { confirmState, requestConfirm, handleConfirm, handleCancel }
}
