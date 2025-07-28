import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
    return (
        <div className="w-full min-h-[calc(100vh-73px)] flex flex-col space-y-2 items-center justify-center">
            <div className="w-full max-w-sm">
                <LoginForm />
            </div>
        </div>
    );
}