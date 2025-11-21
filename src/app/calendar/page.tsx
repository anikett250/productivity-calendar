import Main from '../../../components/main';
import { getServerSession } from "next-auth/next";
import { redirect } from 'next/navigation';

export default async function CalendarPage() {
    const session = await getServerSession();
    
    if (!session) {
        redirect('/login');
    }

    return <Main />;
}