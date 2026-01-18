import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex justify-center">
      <SignUp
        appearance={{
          elements: {
            rootBox: 'w-full',
            card: 'shadow-none border border-border bg-card',
            headerTitle: 'text-foreground',
            headerSubtitle: 'text-muted-foreground',
            socialButtonsBlockButton: 'border-border',
            formFieldLabel: 'text-foreground',
            formFieldInput: 'border-border bg-background',
            footerActionLink: 'text-primary hover:text-primary/80',
          },
        }}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        afterSignUpUrl="/app"
      />
    </div>
  );
}
