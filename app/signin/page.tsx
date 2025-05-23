'use client'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSignIn } from '@clerk/nextjs'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
  } from "@/components/ui/card"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { EyeOff, Eye, Link } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert";
export default function Signin(){
    const { isLoaded, signIn,setActive } = useSignIn()
    const[emailAddress,setEmailAddress]=useState("")
    const[password,setPassword]=useState("")
    const[error,setError]=useState("")
    const[showPassword,setShowPassword]=useState(false)
    const router=useRouter()
    if(!isLoaded)
    {
        return null
    }
    async function Submit(e:React.FormEvent){
        e.preventDefault()
        if(!isLoaded)
        {
            return null;
        }
        try {
          const response=  await signIn.create({
                identifier:emailAddress,password
            })
            if(response.status==="complete")
            {
                await setActive({session:response.createdSessionId})
                router.push('/dashboard')
            }
            else
            {
                console.log(JSON.stringify(response,null,2))
            }
        } catch (error:any) {
            console.error("Error",error.errors[0].message)
            setError(error.errors[0].message)
        }
    }
    return (
        <div className="flex justify-center items-center min-h-screen bg-background">
           <Card className="w-full max-w-md">
              <CardHeader>
              <CardTitle className="text-2xl font-bold text-center"> Sign Up for Todo Master</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={Submit} className="space-y-2">
                        <div>
                            <Label>
                                email
                            </Label>
                            <input type="text"
                            id="email"
                            value={emailAddress}
                            onChange={(e)=>{
                                setEmailAddress(e.target.value)
                            }}
                            required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>
                                password
                            </Label>
                        <div className="relative">
                         <input type="text"
                            id="email"
                            value={password}
                            onChange={(e)=>{
                                setPassword(e.target.value)
                            }}
                            required
                            />
                             <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}

                  </button>
                  {error &&(
                    <Alert variant="destructive">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                        </div>
                        </div>
                        <Button type="submit" className="w-full">
                    Sign in
                      </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="justify-center">
                        <p>Already have an account? {""}
                            <Link href="/signin">sign in</Link>
                        </p>
                    </CardFooter>
                    </Card>

        </div>
    )
}