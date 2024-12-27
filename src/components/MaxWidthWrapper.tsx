import { cn } from "@/lib/utils"
import { ReactNode } from "react"
// here we defined props inline

const MaxwidthWrapper= ({className,children}:{
    className?:string
    children:ReactNode
})=>{
return <div className={cn("h-full mx-auto w-fullmax-w-screen-xl px-2.5 md:px-20",className)}>
{children}
</div>
}
export default MaxwidthWrapper