import Main from "../../../components/main";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

export default async function CalendarPage() {
    const session = await getServerSession(authOptions);

    const cookieStore = await cookies();
    const userSession = cookieStore.get("user_session")?.value;

    if (!session && !userSession) {
        redirect("/login");
    }

    return <Main />;
}