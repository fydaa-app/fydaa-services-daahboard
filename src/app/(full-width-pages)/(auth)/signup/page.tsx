import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "SignUp | Fydaa",
  description: " SignUp ",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
