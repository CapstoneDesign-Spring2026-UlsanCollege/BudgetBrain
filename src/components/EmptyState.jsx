import React from "react";
import { FolderOpenIcon } from "@heroicons/react/24/outline";

export default function EmptyState() {
  return (
    <div className="empty-state glass-card">
      <FolderOpenIcon width={64} className="empty-icon" />
      <h3>No transactions yet</h3>
      <p>Add an expense or budget to see your activity here.</p>
    </div>
  );
}
