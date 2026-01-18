export function PrivacyBanner() {
  return (
    <div className="border-t border-border bg-muted/50 py-4">
      <div className="container">
        <p className="text-center text-sm text-muted-foreground">
          <span className="mr-2">🔒</span>
          Your images never leave your browser &bull; 100% private &bull; No uploads
        </p>
      </div>
    </div>
  );
}
