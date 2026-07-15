import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface EmployeeAvatarProps {
  firstName: string;
  lastName: string;
  className?: string;
}

export default function EmployeeAvatar({ firstName, lastName, className }: EmployeeAvatarProps) {
  const initials = `${firstName[0] || ""}${lastName[0] || ""}`.toUpperCase();
  
  const colors = [
    "bg-red-100 text-red-700",
    "bg-green-100 text-green-700",
    "bg-blue-100 text-blue-700",
    "bg-amber-100 text-amber-700",
    "bg-purple-100 text-purple-700",
    "bg-indigo-100 text-indigo-700",
    "bg-pink-100 text-pink-700",
  ];
  const charCodeSum = (initials.charCodeAt(0) || 0) + (initials.charCodeAt(1) || 0);
  const colorClass = colors[charCodeSum % colors.length];

  return (
    <Avatar className={className}>
      <AvatarFallback className={`${colorClass} font-semibold text-xs`}>
        {initials}
      </AvatarFallback>
    </Avatar>
  );
}
