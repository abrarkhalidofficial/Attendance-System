import { logout } from "@/actions";
import { useRouter } from "next/navigation";


export default function Logout() {
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/');
    };
    return (
        <button className="sidebarBtn" onClick={handleLogout}>
            Logout
        </button>
    )
}
