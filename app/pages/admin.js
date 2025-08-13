import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminPanel() {
  const [password, setPassword] = useState('')
  const [file, setFile] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = () => {
    if (password === process.env.ADMIN_PASSWORD) {
      setIsLoggedIn(true)
    } else {
      setMessage('رمز عبور اشتباه است!')
    }
  }

  const handleUpload = async () => {
    if (!file) return
    
    // آپلود عکس به Supabase Storage
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, file)
    
    if (uploadError) {
      setMessage('خطا در آپلود عکس')
      return
    }
    
    // دریافت لینک عکس
    const { publicURL } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)
    
    // ذخیره لینک در دیتابیس
    const { error: dbError } = await supabase
      .from('images')
      .upsert({ id: 1, url: publicURL })
    
    if (dbError) {
      setMessage('خطا در ذخیره لینک')
    } else {
      setMessage('عکس با موفقیت به‌روز شد!')
    }
  }

  if (!isLoggedIn) {
    return (
      <div style={{ padding: '50px', textAlign: 'center' }}>
        <h2>ورود به پنل مدیریت</h2>
        <input 
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="رمز عبور"
        />
        <button onClick={handleLogin}>ورود</button>
        {message && <p style={{ color: 'red' }}>{message}</p>}
      </div>
    )
  }

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h2>پنل مدیریت عکس</h2>
      <input 
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload} style={{ marginTop: '20px' }}>
        آپلود و به‌روزرسانی عکس
      </button>
      {message && <p style={{ color: 'green' }}>{message}</p>}
    </div>
  )
}