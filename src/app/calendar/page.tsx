import Main from '../../../components/main';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function CalendarPage() {
    // Check for custom user_session cookie (from email login)
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user_session')?.value;
    
    if (!userSession) {
        redirect('/login');
    }

    return <Main />;
}