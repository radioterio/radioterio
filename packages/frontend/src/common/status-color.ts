export const getStatusColor = (status: string): string => {
  switch (status) {
    case "Started":
      return "bg-green-500";
    case "Paused":
      return "bg-yellow-500";
    case "Stopped":
      return "bg-gray-400";
    default:
      return "bg-gray-400";
  }
};
