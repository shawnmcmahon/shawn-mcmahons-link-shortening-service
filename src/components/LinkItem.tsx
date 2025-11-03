"use client";

import Link from "next/link";
import { Link as LinkType } from "../lib/firebase/firebaseUtils";
import CopyButton from "./CopyButton";
import DeleteButton from "./DeleteButton";
import { deleteLink } from "../lib/firebase/firebaseUtils";
import { useAuth } from "../lib/hooks/useAuth";

interface LinkItemProps {
  link: LinkType;
  onDeleted?: () => void;
}

export default function LinkItem({ link, onDeleted }: LinkItemProps) {
  const { user } = useAuth();
  const shortUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/s/${link.shortCode}`;

  const handleDelete = async () => {
    if (!user) return;
    try {
      await deleteLink(link.id, user.uid);
      if (onDeleted) {
        onDeleted();
      }
    } catch (error: any) {
      alert(error.message || "Failed to delete link");
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="font-mono text-sm text-blue-600 font-semibold break-all">
              /s/{link.shortCode}
            </span>
            <CopyButton text={shortUrl} className="text-xs" />
            <button
              type="button"
              onClick={() => {
                if (typeof window !== 'undefined' && shortUrl) {
                  window.open(shortUrl, "_blank", "noopener,noreferrer");
                }
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-md transition-colors bg-blue-600 text-white hover:bg-blue-700 border border-blue-700 flex-shrink-0"
            >
              Visit
            </button>
          </div>
          <a
            href={link.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-gray-600 hover:text-blue-600 break-all line-clamp-2"
          >
            {link.originalUrl}
          </a>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span>{link.clickCount || 0} clicks</span>
            <span>Created {formatDate(link.createdAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/links/${link.shortCode}`}
            className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 border border-blue-200 transition-colors"
          >
            Analytics
          </Link>
          <DeleteButton onDelete={handleDelete} itemName="link" />
        </div>
      </div>
    </div>
  );
}
