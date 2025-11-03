"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "../../../lib/hooks/useAuth";
import { getLinkAnalytics, Click, getLinkByShortCode, deleteLink } from "../../../lib/firebase/firebaseUtils";
import CopyButton from "../../../components/CopyButton";
import DeleteButton from "../../../components/DeleteButton";

export default function LinkAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const shortCode = params.shortCode as string;

  const [link, setLink] = useState<any>(null);
  const [clicks, setClicks] = useState<Click[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    if (!user || !shortCode) return;

    try {
      setLoading(true);
      setError(null);
      
      // Find the link by shortCode first
      const foundLink = await getLinkByShortCode(shortCode);

      if (!foundLink) {
        setError("Link not found");
        setLoading(false);
        return;
      }

      // Verify ownership
      if (foundLink.userId !== user.uid) {
        setError("Unauthorized: You can only view analytics for your own links");
        setLoading(false);
        return;
      }

      // Load analytics
      const analytics = await getLinkAnalytics(foundLink.id);
      setLink(analytics.link);
      setClicks(analytics.clicks);
    } catch (err: any) {
      setError(err.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  }, [user, shortCode]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }

    if (user && shortCode) {
      loadAnalytics();
    }
  }, [user, authLoading, shortCode, router, loadAnalytics]);

  const handleDelete = async () => {
    if (!user || !link) return;
    try {
      await deleteLink(link.id, user.uid);
      router.push("/");
    } catch (error: any) {
      alert(error.message || "Failed to delete link");
    }
  };

  const groupClicksByDate = () => {
    const grouped: { [key: string]: number } = {};
    clicks.forEach((click: Click) => {
      const date = click.date || (click.timestamp?.toDate ? click.timestamp.toDate().toISOString().split("T")[0] : "");
      if (date) {
        grouped[date] = (grouped[date] || 0) + 1;
      }
    });
    return Object.entries(grouped)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, count]) => ({ date, count }));
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => router.push("/")}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!link) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600">Link not found</p>
        </div>
      </div>
    );
  }

  const shortUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/s/${link.shortCode}`;
  const dateGroups = groupClicksByDate();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push("/")}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            ← Back to Links
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Link Analytics</h1>
            <DeleteButton onDelete={handleDelete} itemName="link" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Shortened URL</label>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm text-blue-600 break-all flex-1 min-w-0">{shortUrl}</span>
                <CopyButton text={shortUrl} />
                <button
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined' && shortUrl) {
                      window.open(shortUrl, "_blank", "noopener,noreferrer");
                    }
                  }}
                  className="px-3 py-1.5 text-sm font-medium rounded-md transition-colors bg-blue-600 text-white hover:bg-blue-700 border border-blue-700 flex-shrink-0"
                  style={{ display: 'block' }}
                  data-testid="visit-button"
                >
                  Visit
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Original URL</label>
              <a
                href={link.originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:text-blue-800 break-all"
              >
                {link.originalUrl}
              </a>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Clicks</label>
              <p className="text-2xl font-bold text-gray-900">{link.clickCount || 0}</p>
            </div>
          </div>
        </div>

        {dateGroups.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Clicks by Date</h2>
            <div className="space-y-2">
              {dateGroups.map(({ date, count }) => (
                <div key={date} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-700">{new Date(date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}</span>
                  <span className="font-semibold text-gray-900">{count} {count === 1 ? "click" : "clicks"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {clicks.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Click Events</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {clicks.map((click: Click) => (
                <div
                  key={click.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="text-sm text-gray-600">{formatTimestamp(click.timestamp)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {clicks.length === 0 && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500">No clicks recorded yet for this link.</p>
          </div>
        )}
      </div>
    </div>
  );
}
