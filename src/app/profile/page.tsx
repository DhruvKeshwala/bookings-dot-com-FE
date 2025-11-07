"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/views/no-auth/layout/Header";
import Footer from "@/views/no-auth/layout/Footer";
import http from "@/services/http";
import { getStorageItem, setStorageItem } from "@/services/storage";
import { LOCAL_KEY } from "@/common/enums";

import {
  ProfileSidebar,
  EditProfileForm,
  NotificationSettings,
  SecuritySettings,
  HelpSection,
  SettingsSection,
} from "./components";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>({
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    avatarUrl: "",
  });
  const [editForm, setEditForm] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [activeMenu, setActiveMenu] = React.useState("edit");

  useEffect(() => {
    async function fetchUser() {
      try {
        const storedUser = getStorageItem(LOCAL_KEY.USER);
        const token = getStorageItem(LOCAL_KEY.ACCESS_TOKEN);
        let userObj = null;
        if (storedUser && token) {
          userObj = JSON.parse(storedUser);
          setUser(userObj);
          if (userObj.profile) {
            setProfile(userObj.profile);
            setEditForm({
              firstName: userObj.firstName || "",
              lastName: userObj.lastName || "",
              email: userObj.email || "",
              phone: userObj.phone || "",
              address: userObj.profile?.address || "",
              city: userObj.profile?.city || "",
              state: userObj.profile?.state || "",
              country: userObj.profile?.country || "",
              pincode: userObj.profile?.pincode || "",
              avatarUrl: userObj.profile?.avatarUrl || "",
            });
          }
        } else {
          // No user or token in localStorage, redirect to landing page
          router.push('/');
          return;
        }

        // Call GET /users/user-detail with token in header
        const res = await http.get("/users/user-detail", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.data && res.data.user) {
          setUser(res.data.user);
          // Always update user in localStorage
          setStorageItem(LOCAL_KEY.USER, JSON.stringify(res.data.user));
          // Normalize avatarUrl to absolute URL
          const rawAvatar = res.data.user.profile?.avatarUrl || "";
          const avatarUrl = /^https?:\/\//.test(rawAvatar)
            ? rawAvatar
            : rawAvatar
            ? `https://api.travulu.com${rawAvatar.startsWith("/") ? rawAvatar : "/" + rawAvatar}`
            : "";
          setProfile({
            ...(res.data.user.profile || {}),
            avatarUrl,
          });
          setEditForm({
            firstName: res.data.user.firstName || "",
            lastName: res.data.user.lastName || "",
            email: res.data.user.email || "",
            phone: res.data.user.phone || "",
            address: res.data.user.profile?.address || "",
            city: res.data.user.profile?.city || "",
            state: res.data.user.profile?.state || "",
            country: res.data.user.profile?.country || "",
            pincode: res.data.user.profile?.pincode || "",
            avatarUrl,
          });
        }

      } catch (e) {
        setUser(null);
        setProfile(null);
        setEditForm(null);
        console.error("Failed to fetch user", e);
      } finally {
        setLoading(false);
      }
    }
    fetchUser();
  }, [router]);

  // Redirect if no user after loading
  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [loading, user, router]);

  const handleSidebarClick = (value: string) => {
    setActiveMenu(value);
  };

  const handleEditChange = (field: string, value: string) => {
    setEditForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setSaving(true);
    try {
      const token = getStorageItem(LOCAL_KEY.ACCESS_TOKEN);
      if (!token) {
        router.push("/");
        return;
      }
      // Update profile (address, city, state, country, pincode)
      await http.post(
        "/users/update-profile",
        {
          address: editForm.address,
          city: editForm.city,
          state: editForm.state,
          country: editForm.country,
          pincode: editForm.pincode,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update basic info (firstName, lastName, phone)
      await http.post(
        "/users/update-basic",
        {
          firstName: editForm.firstName,
          lastName: editForm.lastName,
          phone: editForm.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Refetch user detail
      const res = await http.get("/users/user-detail", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data && res.data.user) {
        setUser(res.data.user);
        setProfile(res.data.user.profile);
        setEditForm({
          firstName: res.data.user.firstName || "",
          lastName: res.data.user.lastName || "",
          email: res.data.user.email || "",
          phone: res.data.user.phone || "",
          address: res.data.user.profile?.address || "",
          city: res.data.user.profile?.city || "",
          state: res.data.user.profile?.state || "",
          country: res.data.user.profile?.country || "",
          pincode: res.data.user.profile?.pincode || "",
          avatarUrl: res.data.user.profile?.avatarUrl || "",
        });
      }
    } catch (e) {
      console.error("Failed to update profile", e);
    } finally {
      setSaving(false);
    }
  };

  const renderMainContent = () => {
    if (loading) return <div>Loading...</div>;
    if (!user || !profile || !editForm) {
      return (
        <div className="text-red-500 font-semibold">
          User data could not be loaded.<br />
          <span className="text-xs text-gray-700">Debug info:</span>
          <pre className="bg-gray-100 text-xs p-2 rounded mt-2 overflow-x-auto">
            {JSON.stringify({ user, profile, editForm }, null, 2)}
          </pre>
          <br />
          Please make sure you are logged in and try again.<br />
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => window.location.reload()}
          >
            Reload Page
          </button>
        </div>
      );
    }

    switch (activeMenu) {
      case "edit":
        return (
          <EditProfileForm
            user={user}
            editForm={editForm}
            onFormChange={handleEditChange}
            onSubmit={handleEditSubmit}
            saving={saving}
          />
        );
      case "notification":
        return <NotificationSettings />;
      case "security":
        return <SecuritySettings user={user} />;
      case "help":
        return <HelpSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return null;
    }
  };

  // Don't render if no user
  if (!user) {
    return null;
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-[#f7f8fa] flex">
        <ProfileSidebar activeMenu={activeMenu} onMenuClick={handleSidebarClick} />
        <main className="flex-1 p-10 flex flex-col items-center">
          {renderMainContent()}
        </main>
      </div>
      <Footer />
    </>
  );
}
