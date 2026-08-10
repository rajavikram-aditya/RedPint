import { createFileRoute } from "@tanstack/react-router";
import { FileText, ShieldCheck, ShieldAlert, Upload } from "lucide-react";
import { RequireAuth } from "@/components/require-auth";
import { useAuth } from "@/lib/auth-context";
import { PageHeader } from "@/components/redpint-ui";

export const Route = createFileRoute("/donor/documents")({
  head: () => ({
    meta: [{ title: "My Documents — RedPint" }],
  }),
  component: () => (
    <RequireAuth allowedRoles={["donor"]}>
      <DonorDocuments />
    </RequireAuth>
  ),
});

function DonorDocuments() {
  const { profile } = useAuth();

  const hasDocument = !!profile?.documentUrl;
  const isVerified = !!profile?.verified;

  return (
    <>
      <PageHeader
        eyebrow="Donor view"
        title="My documents"
        description="Documents you uploaded during registration and your current verification status."
      />

      <div className="mx-auto max-w-2xl px-5 py-10">
        {/* Verification status */}
        <div className={`rounded-lg border p-6 shadow-panel ${isVerified ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"}`}>
          <div className="flex items-center gap-3">
            {isVerified ? (
              <ShieldCheck className="size-8 text-success" />
            ) : (
              <ShieldAlert className="size-8 text-warning" />
            )}
            <div>
              <h2 className="text-lg font-bold">
                {isVerified ? "Account verified" : "Verification pending"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isVerified
                  ? "Your identity has been verified. You are eligible to be matched with blood requests."
                  : "Your account is awaiting verification. You will be eligible for matching once verified."}
              </p>
            </div>
          </div>
        </div>

        {/* Uploaded document */}
        <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-panel">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <FileText className="size-5 text-primary" />
            ID / Donation Certificate
          </h3>

          {hasDocument ? (
            <div className="mt-4">
              <a
                href={profile.documentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md border border-primary/25 bg-primary/5 px-4 py-3 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
              >
                <FileText className="size-4" />
                View uploaded document
              </a>
              <p className="mt-2 text-xs text-muted-foreground">
                Uploaded at registration. Contact support to replace this document.
              </p>
            </div>
          ) : (
            <div className="mt-4 rounded-lg border-2 border-dashed border-border p-8 text-center">
              <Upload className="mx-auto size-8 text-muted-foreground" />
              <p className="mt-3 text-sm text-muted-foreground">
                No document was uploaded during registration.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                You can upload an ID proof or past donation certificate to speed up verification.
              </p>
            </div>
          )}
        </div>

        {/* Profile summary */}
        <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-panel">
          <h3 className="text-lg font-bold">Profile details</h3>
          <dl className="mt-4 grid gap-3 text-sm">
            <div className="flex justify-between border-b border-border pb-2">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{profile?.name || "—"}</dd>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{profile?.email || "—"}</dd>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <dt className="text-muted-foreground">Phone</dt>
              <dd className="font-medium">{profile?.phone || "—"}</dd>
            </div>
            <div className="flex justify-between border-b border-border pb-2">
              <dt className="text-muted-foreground">Blood group</dt>
              <dd className="font-mono font-bold text-primary">{profile?.bloodGroup || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Last donation</dt>
              <dd className="font-medium">
                {profile?.lastDonationDate
                  ? new Date(profile.lastDonationDate).toLocaleDateString()
                  : "Never"}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </>
  );
}
