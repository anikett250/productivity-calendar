import Main from '../../../components/main';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export default async function CalendarPage() {
    // Check for custom user_session cookie (from email login) or NextAuth session token
    const cookieStore = await cookies();
    const userSession = cookieStore.get('user_session')?.value;
    const nextAuthToken = cookieStore.get('next-auth.session-token')?.value;
    
    if (!userSession && !nextAuthToken) {
        redirect('/login');
    }

    return <Main />;
}