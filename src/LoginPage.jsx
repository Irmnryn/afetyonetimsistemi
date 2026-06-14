import { useState } from 'react'
import AidAnimation from './components/AidAnimation'

const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '')

const PHONE_REGEX = /^5\d{9}$/
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.])[A-Za-z\d@$!%*?&.]{8,16}$/

const ROLE_PATHS = {
  ADMIN: '/admin',
  KOORDINATOR: '/koordinator',
  DEPO_SORUMLUSU: '/depo-gorevlisi',
  USER: '/user',
}

const ALERT_STYLES = {
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  info: 'border-slate-200 bg-slate-50 text-slate-700',
}

const TEL_STORAGE_PREFIX = 'afet_tel_'

function setStoredTelNo(tc, telNo) {
  if (tc && telNo) {
    window.localStorage.setItem(`${TEL_STORAGE_PREFIX}${tc}`, toLocalPhone(telNo))
  }
}

function getErrorMessage(responsePayload, status) {
  if (typeof responsePayload === 'string' && responsePayload.trim()) {
    return responsePayload
  }

  if (responsePayload && typeof responsePayload === 'object') {
    const structured =
      responsePayload.message ||
      responsePayload.error ||
      responsePayload.aciklama ||
      responsePayload.details

    if (structured) {
      return String(structured)
    }
  }

  return `İstek başarısız (HTTP ${status}).`
}

function isValidTcNumber(tc) {
  if (!/^\d{11}$/.test(tc) || tc.startsWith('0')) {
    return false
  }

  const digits = tc.split('').map(Number)
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8]
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7]
  const tenthDigit = ((oddSum * 7) - evenSum) % 10
  const eleventhDigit = (digits.slice(0, 10).reduce((sum, digit) => sum + digit, 0)) % 10

  return digits[9] === (tenthDigit + 10) % 10 && digits[10] === eleventhDigit
}

function getTcErrorMessage() {
  return 'TC kimlik numarası geçerli algoritmaya uygun olmalıdır.'
}

function normalizePhoneDigits(value) {
  return value.replace(/\D/g, '')
}

function toLocalPhone(value) {
  const digits = normalizePhoneDigits(String(value ?? ''))

  if (!digits) {
    return ''
  }

  const stripped = digits.startsWith('90')
    ? digits.slice(2)
    : digits.startsWith('0')
      ? digits.slice(1)
      : digits

  return stripped.slice(0, 10)
}

function toBackendPhone(value) {
  const localPhone = toLocalPhone(value)
  return localPhone ? `0${localPhone}` : ''
}

function formatPhoneDisplay(value) {
  const localPhone = toLocalPhone(value)

  if (!localPhone) {
    return ''
  }

  return [localPhone.slice(0, 3), localPhone.slice(3, 6), localPhone.slice(6, 8), localPhone.slice(8, 10)]
    .filter(Boolean)
    .join(' ')
}

async function requestJson(path, options = {}) {
  const { auth = true, ...requestOptions } = options
  const token = auth ? window.localStorage.getItem('afet_token') : null

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(requestOptions.headers || {}),
    },
    ...requestOptions,
  })

  const rawText = await response.text()
  let payload = null

  if (rawText) {
    try {
      payload = JSON.parse(rawText)
    } catch {
      payload = rawText
    }
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(payload, response.status))
  }

  return payload
}

function LoginPage({ onLoginSuccess }) {
  const [view, setView] = useState('login')
  const [alert, setAlert] = useState(null)
  const [authResponse, setAuthResponse] = useState(null)
  const [isPasswordFocused, setIsPasswordFocused] = useState(false)
  const [showDonationIban, setShowDonationIban] = useState(false)
  const [passwordFlow, setPasswordFlow] = useState('firstLogin')
  const [passwordChangeContext, setPasswordChangeContext] = useState({
    tc: '',
    telNo: '',
  })

  const [loginLoading, setLoginLoading] = useState(false)
  const [newUserPhoneLoading, setNewUserPhoneLoading] = useState(false)
  const [forgotLoading, setForgotLoading] = useState(false)
  const [forcePasswordLoading, setForcePasswordLoading] = useState(false)

  const [loginForm, setLoginForm] = useState({
    tc: '',
    password: '',
  })

  const [authContext, setAuthContext] = useState({
    tc: '',
    password: '',
    telNo: '',
    source: 'login',
  })

  const [newUserPhoneForm, setNewUserPhoneForm] = useState({
    telNo: '',
  })

  const [forgotForm, setForgotForm] = useState({
    tc: '',
    telNo: '',
  })

  const [forcePasswordForm, setForcePasswordForm] = useState({
    yeniSifre: '',
    yeniSifreTekrar: '',
  })

  const sanitizeDigits = (value, length) =>
    value.replace(/\D/g, '').slice(0, length)

  const handleAuthSuccess = (response) => {
    const mappedAuth = {
      token: response?.token ?? '',
      role: response?.role ?? 'USER',
      ilkGiris: Boolean(response?.ilkGiris),
      yeniKullanici: Boolean(response?.yeniKullanici),
    }

    if (mappedAuth.token) {
      window.localStorage.setItem('afet_token', mappedAuth.token)
      window.localStorage.setItem('token', mappedAuth.token)
    }

    if (response?.role) {
      window.localStorage.setItem('afet_role', mappedAuth.role)
      window.localStorage.setItem('role', mappedAuth.role)
    }

    setAuthResponse(mappedAuth)

    if (mappedAuth.ilkGiris) {
      setPasswordFlow('firstLogin')
      setView('forcePassword')
      setAlert({
        type: 'info',
        text: 'İlk giriş tespit edildi. Lütfen yeni şifre oluşturun.',
      })
      return
    }

    onLoginSuccess?.(mappedAuth)
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setAlert(null)

    if (!isValidTcNumber(loginForm.tc)) {
      setAlert({
        type: 'error',
        text: getTcErrorMessage(),
      })
      return
    }

    if (!PASSWORD_REGEX.test(loginForm.password)) {
      setAlert({
        type: 'error',
        text: 'Şifre 8-16 karakter olmalı ve kuralları sağlamalıdır.',
      })
      return
    }

    setLoginLoading(true)

    try {
      const response = await requestJson('/api/auth/login', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({
          tc: loginForm.tc,
          password: loginForm.password,
        }),
      })

      if (response?.yeniKullanici) {
        setAuthContext({
          tc: loginForm.tc,
          password: loginForm.password,
          telNo: '',
          source: 'login',
        })
        setNewUserPhoneForm({ telNo: '' })
        setView('newUserPhone')
        setAlert({
          type: 'info',
          text: 'Yeni kullanıcı kaydı için telefon numarası gerekli.',
        })
        return
      }

      handleAuthSuccess(response)
    } catch (error) {
      const errorText =
        error instanceof Error ? error.message : 'Giriş adımı tamamlanamadı.'
      setAlert({ type: 'error', text: errorText })
    } finally {
      setLoginLoading(false)
    }
  }

  const handleNewUserPhoneSubmit = async (event) => {
    event.preventDefault()
    setAlert(null)

    if (!PHONE_REGEX.test(newUserPhoneForm.telNo)) {
      setAlert({
        type: 'error',
        text: 'Telefon numarası +90 5XX XXX XX XX formatında olmalıdır.',
      })
      return
    }

    if (!authContext.tc || !authContext.password) {
      setView('login')
      setAlert({
        type: 'error',
        text: 'Önce giriş bilgilerini tekrar girin.',
      })
      return
    }

    setNewUserPhoneLoading(true)

    try {
      const response = await requestJson('/api/auth/kayit', {
        method: 'POST',
        auth: false,
        body: JSON.stringify({
          tc: authContext.tc,
          password: authContext.password,
          telNo: toBackendPhone(newUserPhoneForm.telNo),
        }),
      })

      setAuthContext((prev) => ({ ...prev, telNo: newUserPhoneForm.telNo }))
      setStoredTelNo(authContext.tc, newUserPhoneForm.telNo)
      handleAuthSuccess(response)
    } catch (error) {
      setAlert({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Telefon bilgisi kaydedilemedi.',
      })
    } finally {
      setNewUserPhoneLoading(false)
    }
  }

  const handleForgotSendCode = async (event) => {
    event.preventDefault()
    setAlert(null)

    if (!isValidTcNumber(forgotForm.tc)) {
      setAlert({
        type: 'error',
        text: getTcErrorMessage(),
      })
      return
    }

    if (!PHONE_REGEX.test(forgotForm.telNo)) {
      setAlert({
        type: 'error',
        text: 'Telefon numarası +90 5XX XXX XX XX formatında olmalıdır.',
      })
      return
    }

    setForgotLoading(true)

    try {
      await requestJson('/api/auth/passwordRegen', {
        method: 'PUT',
        auth: false,
        body: JSON.stringify({
          tc: forgotForm.tc,
          telNo: toBackendPhone(forgotForm.telNo),
        }),
      })

      setPasswordFlow('reset')
      setPasswordChangeContext({
        tc: forgotForm.tc,
        telNo: forgotForm.telNo,
      })
      setView('forcePassword')
      setAlert({
        type: 'success',
        text: 'Bilgiler doğrulandı. Yeni şifre belirleyin.',
      })
    } catch (error) {
      setAlert({
        type: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'İşlem başarısız.',
      })
    } finally {
      setForgotLoading(false)
    }
  }

  const handleForcePasswordSubmit = (event) => {
    event.preventDefault()
    setAlert(null)

    if (!PASSWORD_REGEX.test(forcePasswordForm.yeniSifre)) {
      setAlert({
        type: 'error',
        text: 'Yeni şifre güçlü şifre kurallarını sağlamalıdır.',
      })
      return
    }

    if (forcePasswordForm.yeniSifre !== forcePasswordForm.yeniSifreTekrar) {
      setAlert({
        type: 'error',
        text: 'Yeni şifre ve tekrar alanı aynı olmalıdır.',
      })
      return
    }

    setForcePasswordLoading(true)

    const requestBody =
      passwordFlow === 'reset'
        ? {
            tc: passwordChangeContext.tc,
            telNo: toBackendPhone(passwordChangeContext.telNo),
            sifre: forcePasswordForm.yeniSifre,
          }
        : {
            sifre: forcePasswordForm.yeniSifre,
          }

    const requestPath =
      passwordFlow === 'reset'
        ? '/api/auth/sifreDegisimi'
        : '/api/user/sifre-yenileme'

    requestJson(requestPath, {
      method: 'PUT',
      auth: passwordFlow !== 'reset',
      body: JSON.stringify(requestBody),
    })
      .then(() => {
        setForcePasswordLoading(false)
        if (passwordFlow === 'reset') {
          setView('login')
          setLoginForm({ tc: passwordChangeContext.tc, password: '' })
          setForgotForm({
            tc: '',
            telNo: '',
          })
          setAlert({
            type: 'success',
            text: 'Şifre güncellendi. Lütfen yeniden giriş yapın.',
          })
          return
        }

        setView('success')
        setAlert({
          type: 'success',
          text: 'Yeni şifre oluşturuldu. Giriş tamamlandı.',
        })
      })
      .catch((error) => {
        setForcePasswordLoading(false)
        setAlert({
          type: 'error',
          text:
            error instanceof Error
              ? error.message
              : 'Şifre güncelleme işlemi başarısız.',
        })
      })
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-6 sm:px-5 sm:py-8">
      <section
        className="grid w-full overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white/95 shadow-panel backdrop-blur divide-x divide-slate-200"
        style={{ gridTemplateColumns: 'minmax(220px, 0.82fr) minmax(280px, 1.18fr)' }}
      >
        <aside className="bg-white/95 p-5 sm:p-6">
          <div className="flex h-full flex-col">
            <p className="mb-5 text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Afet Müdahale Uygulaması
            </p>
            <div className="aid-panel overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white p-4">
              <AidAnimation />
            </div>

            <div className="mt-6">
              <button
                type="button"
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-emerald-600 px-6 text-base font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
                onClick={() => setShowDonationIban((prev) => !prev)}
              >
                Bağış Yap
              </button>
            </div>

            {showDonationIban && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
                <p className="text-sm font-semibold text-emerald-800">IBAN</p>
                <p className="mt-2 break-all text-sm font-medium text-emerald-700">
                  TR12 3456 7890 1234 5678 9012 34
                </p>
              </div>
            )}
          </div>
        </aside>

        <div className="bg-white/95 p-6 sm:p-8">
          <div className="mb-10">
            <h1 className="font-display text-4xl font-semibold text-slate-900 sm:text-5xl">
              Giriş
            </h1>
          </div>

          {alert && (
            <div
              className={`mb-6 rounded-xl border px-4 py-3 text-sm ${ALERT_STYLES[alert.type]}`}
              role="status"
            >
              {alert.text}
            </div>
          )}

          {view === 'login' && (
            <form className="space-y-5" onSubmit={handleLoginSubmit}>
              <div>
                <label htmlFor="tc" className="field-label">
                  TC Kimlik Numarası
                </label>
                <input
                  id="tc"
                  className="field-input"
                  inputMode="numeric"
                  placeholder="11 haneli TC"
                  value={loginForm.tc}
                  onChange={(event) =>
                    setLoginForm((prev) => ({
                      ...prev,
                      tc: sanitizeDigits(event.target.value, 11),
                    }))
                  }
                />
              </div>

              <div>
                <label htmlFor="password" className="field-label">
                  Şifre
                </label>
                <input
                  id="password"
                  type="password"
                  className="field-input"
                  placeholder="Şifrenizi girin"
                  value={loginForm.password}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  onChange={(event) =>
                    setLoginForm((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                />
                <p className="mt-3 text-sm text-slate-500">
                  (İlk defa giriş yapıyorsanız oluşturacağınız şifreyi yazınız)
                </p>
                {isPasswordFocused && (
                  <p className="mt-2 text-sm text-slate-500">
                    8-16 karakter olmalı; en az 1 büyük harf, 1 küçük harf, 1
                    rakam ve 1 özel işaret içermelidir.
                  </p>
                )}
              </div>

              <div className="grid gap-4 pt-4 sm:grid-cols-2">
                <button
                  type="submit"
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-blue-700 px-6 text-base font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={loginLoading}
                >
                  {loginLoading ? 'Bekleyin...' : 'Giriş Yap'}
                </button>
                <button
                  type="button"
                  className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-red-600 px-6 text-base font-semibold text-white transition hover:bg-red-700 focus:outline-none focus:ring-4 focus:ring-red-200"
                  onClick={() => {
                    setView('forgotPassword')
                    setAlert(null)
                  }}
                >
                  Şifremi Unuttum
                </button>
              </div>
            </form>
          )}

          {view === 'newUserPhone' && (
          <form className="space-y-5" onSubmit={handleNewUserPhoneSubmit}>
            <div>
              <label htmlFor="newUserTelNo" className="field-label">
                Telefon Numarası (+90)
              </label>
              <div className="flex h-11 overflow-hidden rounded-xl border border-slate-300 bg-white transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
                <span className="flex items-center border-r border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600">
                  +90
                </span>
                <input
                  id="newUserTelNo"
                  className="min-w-0 flex-1 bg-transparent px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  inputMode="tel"
                  placeholder="5XX XXX XX XX"
                  value={formatPhoneDisplay(newUserPhoneForm.telNo)}
                  onChange={(event) =>
                    setNewUserPhoneForm({
                      telNo: toLocalPhone(event.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 pt-4 sm:grid-cols-2">
              <button
                type="button"
                className="btn-muted w-full"
                onClick={() => setView('login')}
              >
                Geri Dön
              </button>
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={newUserPhoneLoading}
              >
                {newUserPhoneLoading ? 'Bekleyin...' : 'Kayıt Ol'}
              </button>
            </div>
          </form>
        )}

          {view === 'forgotPassword' && (
          <form className="space-y-5" onSubmit={handleForgotSendCode}>
            <div>
              <label htmlFor="forgotTc" className="field-label">
                TC Kimlik Numarası
              </label>
              <input
                id="forgotTc"
                className="field-input"
                inputMode="numeric"
                placeholder="11 haneli TC"
                value={forgotForm.tc}
                onChange={(event) =>
                  setForgotForm((prev) => ({
                    ...prev,
                    tc: sanitizeDigits(event.target.value, 11),
                  }))
                }
              />
            </div>

            <div>
              <label htmlFor="forgotTelNo" className="field-label">
                Telefon Numarası (+90)
              </label>
              <div className="flex h-11 overflow-hidden rounded-xl border border-slate-300 bg-white transition focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
                <span className="flex items-center border-r border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600">
                  +90
                </span>
                <input
                  id="forgotTelNo"
                  className="min-w-0 flex-1 bg-transparent px-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                  inputMode="tel"
                  placeholder="5XX XXX XX XX"
                  value={formatPhoneDisplay(forgotForm.telNo)}
                  onChange={(event) =>
                    setForgotForm((prev) => ({
                      ...prev,
                      telNo: toLocalPhone(event.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className="grid gap-4 pt-4 sm:grid-cols-2">
              <button
                type="button"
                className="btn-muted w-full"
                onClick={() => {
                  setView('login')
                  setAlert(null)
                }}
              >
                Girişe Dön
              </button>
              <button
                type="submit"
                className="btn-primary w-full"
                disabled={forgotLoading}
              >
                {forgotLoading ? 'Bekleyin...' : 'Şifreyi Güncelle'}
              </button>
            </div>
          </form>
        )}

          {view === 'forcePassword' && (
          <form className="space-y-5" onSubmit={handleForcePasswordSubmit}>
            <div>
              <label htmlFor="yeniSifre" className="field-label">
                {passwordFlow === 'reset' ? 'Yeni Şifre' : 'Yeni Şifre'}
              </label>
              <input
                id="yeniSifre"
                type="password"
                className="field-input"
                placeholder="Yeni şifrenizi girin"
                value={forcePasswordForm.yeniSifre}
                onChange={(event) =>
                  setForcePasswordForm((prev) => ({
                    ...prev,
                    yeniSifre: event.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label htmlFor="yeniSifreTekrar" className="field-label">
                Yeni Şifre Tekrar
              </label>
              <input
                id="yeniSifreTekrar"
                type="password"
                className="field-input"
                placeholder="Yeni şifreyi tekrar girin"
                value={forcePasswordForm.yeniSifreTekrar}
                onChange={(event) =>
                  setForcePasswordForm((prev) => ({
                    ...prev,
                    yeniSifreTekrar: event.target.value,
                  }))
                }
              />
            </div>

            <button
              type="submit"
              className="btn-primary w-full"
              disabled={forcePasswordLoading}
            >
              {forcePasswordLoading
                ? 'Kaydediliyor...'
                : passwordFlow === 'reset'
                  ? 'Şifreyi Güncelle'
                  : 'Yeni Şifre Oluştur'}
            </button>
          </form>
        )}

          {view === 'success' && (
          <div className="space-y-5">
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
              <p className="text-sm font-semibold text-emerald-800">
                Giriş başarılı
              </p>
              <p className="mt-2 text-sm text-emerald-700">
                Kullanıcı rolü:{' '}
                <span className="font-semibold">{authResponse?.role}</span>
              </p>
              <p className="text-sm text-emerald-700">
                Önerilen yönlendirme:{' '}
                <span className="font-semibold">
                  {ROLE_PATHS[authResponse?.role] ?? '/dashboard'}
                </span>
              </p>
            </div>

            <button
              type="button"
              className="btn-muted w-full"
              onClick={() => {
                setView('login')
                setAlert(null)
                setLoginForm({ tc: '', password: '' })
              }}
            >
              Yeni Giriş Başlat
            </button>
          </div>
          )}
        </div>
      </section>
    </main>
  )
}

export default LoginPage
