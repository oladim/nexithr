import VerifyClient from "../VerifyClient";

export const metadata = { title: "Verify a certificate — NexIT-Africa" };

export default function VerifyOne({ params }) {
  return <VerifyClient id={decodeURIComponent(params.id || "")} />;
}
