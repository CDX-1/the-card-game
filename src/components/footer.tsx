import Link from "next/link";

export default function Footer() {
    return (
        <footer className="w-full bg-card border-1 py-6 mt-auto">
            <div className="flex justify-center space-x-14 container mx-auto text-card-foreground">
                <h2 className="font-semibold">CDX&apos;s &quot;The Card Game&quot;</h2>
                <div className="space-x-8">
                    <Link href="/terms">
                        Terms
                    </Link>

                    <Link href="/terms">
                        Privacy
                    </Link>

                    <Link href="/terms">
                        Security
                    </Link>

                    <Link href="/terms">
                        Contact
                    </Link>
                </div>
            </div>
        </footer>
    );
}
