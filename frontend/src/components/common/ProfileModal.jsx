import { useState } from 'react'
import Modal from './Modal'
import { InlineSpinner } from './LoadingSpinner'
import { changePassword } from '../../services/firebase'
import { useAuth } from '../../context/AuthContext'
import { roleBadgeClass } from '../../utils/helpers'
import toast from 'react-hot-toast'

const MIN_LENGTH = 8

function passwordStrength(pwd) {
  if (!pwd) return { score: 0, label: '', color: '' }
  let score = 0
  if (pwd.length >= MIN_LENGTH)          score++
  if (pwd.length >= 12)                  score++
  if (/[A-Z]/.test(pwd))                score++
  if (/[0-9]/.test(pwd))                score++
  if (/[^A-Za-z0-9]/.test(pwd))         score++
  const map = [
    { label: '',         color: '' },
    { label: 'Weak',     color: 'bg-red-400' },
    { label: 'Fair',     color: 'bg-amber-400' },
    { label: 'Good',     color: 'bg-yellow-400' },
    { label: 'Strong',   color: 'bg-emerald-400' },
    { label: 'Very strong', color: 'bg-emerald-600' },
  ]
  return { score, ...map[score] }
}

export default function ProfileModal({ isOpen, onClose }) {
  const { user, role } = useAuth()

  const [current,   setCurrent]   = useState('')
  const [next,      setNext]      = useState('')
  const [confirm,   setConfirm]   = useState('')
  const [showCur,   setShowCur]   = useState(false)
  const [showNew,   setShowNew]   = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [errors,    setErrors]    = useState({})

  const strength = passwordStrength(next)

  const validate = () => {
    const e = {}
    if (!current)                                    e.current  = 'Current password is required.'
    if (!next)                                       e.next     = 'New password is required.'
    else if (next.length < MIN_LENGTH)               e.next     = `At least ${MIN_LENGTH} characters required.`
    else if (next === current)                       e.next     = 'New password must differ from current.'
    if (confirm !== next)                            e.confirm  = 'Passwords do not match.'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      await changePassword(current, next)
      toast.success('Password updated successfully.')
      handleClose()
    } catch (err) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrors({ current: 'Current password is incorrect.' })
      } else if (err.code === 'auth/too-many-requests') {
        setErrors({ current: 'Too many attempts. Please try again later.' })
      } else {
        toast.error(err.message ?? 'Failed to update password.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setCurrent(''); setNext(''); setConfirm('')
    setErrors({}); setShowCur(false); setShowNew(false)
    onClose()
  }

  const initials = user?.email?.[0]?.toUpperCase() ?? 'U'

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="My Profile" size="sm">
      <div className="space-y-6">

        {/* ── User info card ──────────────────────────────────────── */}
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700">
            {initials}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900">{user?.email}</p>
            <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${roleBadgeClass(role)}`}>
              {role?.toUpperCase()}
            </span>
          </div>
        </div>

        {/* ── Change password ─────────────────────────────────────── */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Change Password</p>

          {/* Current password */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Current Password</label>
            <div className="relative">
              <input
                type={showCur ? 'text' : 'password'}
                value={current}
                onChange={e => { setCurrent(e.target.value); setErrors(p => ({ ...p, current: undefined })) }}
                placeholder="Enter current password"
                className={inputCls(errors.current)}
              />
              <EyeToggle show={showCur} onToggle={() => setShowCur(v => !v)} />
            </div>
            {errors.current && <p className="text-xs text-red-500">{errors.current}</p>}
          </div>

          {/* New password */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={next}
                onChange={e => { setNext(e.target.value); setErrors(p => ({ ...p, next: undefined })) }}
                placeholder={`At least ${MIN_LENGTH} characters`}
                className={inputCls(errors.next)}
              />
              <EyeToggle show={showNew} onToggle={() => setShowNew(v => !v)} />
            </div>
            {/* Strength meter */}
            {next && (
              <div className="mt-1.5 space-y-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        i <= strength.score ? strength.color : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                {strength.label && (
                  <p className="text-xs text-gray-500">Strength: <span className="font-medium text-gray-700">{strength.label}</span></p>
                )}
              </div>
            )}
            {errors.next && <p className="text-xs text-red-500">{errors.next}</p>}
          </div>

          {/* Confirm password */}
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                value={confirm}
                onChange={e => { setConfirm(e.target.value); setErrors(p => ({ ...p, confirm: undefined })) }}
                placeholder="Repeat new password"
                className={inputCls(errors.confirm)}
              />
            </div>
            {errors.confirm && <p className="text-xs text-red-500">{errors.confirm}</p>}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-700 disabled:opacity-60"
            >
              {submitting && <InlineSpinner />}
              Update Password
            </button>
          </div>
        </form>

      </div>
    </Modal>
  )
}

function EyeToggle({ show, onToggle }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
      aria-label={show ? 'Hide password' : 'Show password'}
    >
      {show ? (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )}
    </button>
  )
}

const inputCls = (err) =>
  `w-full rounded-lg border px-3 py-2 pr-10 text-sm text-gray-800 shadow-sm placeholder-gray-400
   transition focus:outline-none focus:ring-2
   ${err
     ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-red-100'
     : 'border-gray-200 bg-white focus:border-primary-400 focus:ring-primary-100'}`
