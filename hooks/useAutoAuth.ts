// hooks/useAutoAuth.ts
import { useSession, signIn } from "next-auth/react"
import { useEffect, useState } from "react"

export const useAutoAuth = () => {
  const { data: session, status } = useSession()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const autoSignIn = async () => {
      // Only attempt auto sign-in if user is not authenticated and session is loaded
      if (status === "loading") return
      
      if (status === "unauthenticated" && !isInitialized) {
        try {
          // Automatically trigger Google sign-in
          await signIn("google", { 
            redirect: false,
            callbackUrl: window.location.href 
          })
        } catch (error) {
          console.error("Auto sign-in failed:", error)
        } finally {
          setIsInitialized(true)
        }
      } else if (status === "authenticated") {
        setIsInitialized(true)
      }
    }

    autoSignIn()
  }, [status, isInitialized])

  return {
    session,
    status,
    isInitialized,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading" || !isInitialized
  }
}