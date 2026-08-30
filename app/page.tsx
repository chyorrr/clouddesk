import { redirect } from 'next/navigation'

// Root page redirects to login (middleware handles the case where user is logged in → /desktop)
export default function RootPage() {
  redirect('/login')
}
