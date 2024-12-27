import MaxwidthWrapper from "./MaxWidthWrapper";
import Link from "next/link";
import { buttonVariants } from "./ui/button";
import {getKindeServerSession} from "@kinde-oss/kinde-auth-nextjs/server";


const Navbar = async() => {
    const{getUser}=getKindeServerSession();
    const user = await getUser()
//   const user = undefined;
  const isAdmin = user?.email ===process.env.ADMIN_EMAIL;

  return (
    <nav className="sticky z-100 h-14 inset-x-0 top-0 w-full border-b border-gray-500 bg-blue-400 backdrop-blur-lg transition-all">
      <MaxwidthWrapper>
        {/* Main Navbar Container */}
        <div className="flex items-center justify-between h-full">
          {/* Logo */}
          <Link href="/" className="flex z-40 font-semibold">
            CUSTOM<span className="text-green-400">UI</span>
          </Link>

          {/* Links Section */}
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href="/api/auth/logout"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Sign out
                </Link>
                {isAdmin && (
                  <Link
                    href="/api/admin/dashboard"
                    className={buttonVariants({
                      size: "sm",
                      variant: "ghost",
                    })}
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/configure/upload"
                  className={buttonVariants({
                    size: "sm",
                    className: "hidden sm:flex items-center gap-1",
                  })}
                >
                  Design your own
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/api/auth/register"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Register
                </Link>

                <Link
                  href="/api/auth/login"
                  className={buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  })}
                >
                  Login
                </Link>
                <Link
                  href="/api/configure/upload"
                  className={buttonVariants({
                    size: "sm",
                    className: "hidden sm:flex items-center gap-1",
                  })}
                >
                  Design your own
                </Link>
              </>
            )}
          </div>
        </div>
      </MaxwidthWrapper>
    </nav>
  );
};

export default Navbar;
