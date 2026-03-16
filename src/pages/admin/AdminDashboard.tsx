import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PreciseLogo from "@/components/PreciseLogo";
import { toast } from "@/hooks/use-toast";
import { Users, Plus, LogOut } from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  user_type: string;
  custom_user_id: string;
  created_at: string;
  last_sign_in_at: string | null;
}

const AdminDashboard = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    user_type: "student",
    custom_user_id: "",
  });

  const fetchUsers = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/admin-users`,
      {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
      }
    );
    const data = await res.json();
    if (res.ok) {
      setUsers(data.users);
      setTotal(data.total);
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.full_name) {
      toast({ title: "Error", description: "Fill all required fields", variant: "destructive" });
      return;
    }

    setCreating(true);
    const { data: { session } } = await supabase.auth.getSession();
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

    const res = await fetch(
      `https://${projectId}.supabase.co/functions/v1/admin-users`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      }
    );
    const data = await res.json();
    setCreating(false);

    if (res.ok) {
      toast({ title: "User created successfully" });
      setDialogOpen(false);
      setForm({ email: "", password: "", full_name: "", user_type: "student", custom_user_id: "" });
      fetchUsers();
    } else {
      toast({ title: "Error", description: data.error, variant: "destructive" });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col px-6 pt-8 pb-8 max-w-4xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <PreciseLogo size={36} />
          <div>
            <span className="font-bold text-lg text-foreground">PreciseDM</span>
            <span className="ml-2 text-xs font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              Admin
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleSignOut} className="rounded-lg gap-2">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Users</p>
              <p className="text-3xl font-bold text-foreground">
                {loading ? "—" : total}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 flex items-center justify-center">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 h-12 rounded-xl font-semibold">
                <Plus className="h-5 w-5" />
                Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 rounded-xl">
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label>Full Name *</Label>
                  <Input
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    placeholder="John Doe"
                    className="h-11 rounded-xl bg-muted/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="user@example.com"
                    className="h-11 rounded-xl bg-muted/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="Min. 8 characters"
                    className="h-11 rounded-xl bg-muted/40"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>User Type</Label>
                  <Select
                    value={form.user_type}
                    onValueChange={(v) => setForm({ ...form, user_type: v })}
                  >
                    <SelectTrigger className="h-11 rounded-xl bg-muted/40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="practitioner">Practitioner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>User ID (optional)</Label>
                  <Input
                    value={form.custom_user_id}
                    onChange={(e) => setForm({ ...form, custom_user_id: e.target.value })}
                    placeholder="Hospital / Student ID"
                    className="h-11 rounded-xl bg-muted/40"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={creating}
                  className="w-full h-11 rounded-xl font-semibold"
                >
                  {creating ? "Creating..." : "Create User"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Users Table */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-foreground mb-4">All Users</h2>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading users...</p>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left p-3 font-medium text-muted-foreground">Name</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Email</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-border">
                      <td className="p-3 text-foreground">{u.full_name || "—"}</td>
                      <td className="p-3 text-muted-foreground">{u.email}</td>
                      <td className="p-3">
                        <span className="text-xs font-medium bg-accent px-2 py-0.5 rounded-full text-accent-foreground capitalize">
                          {u.user_type}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-6 text-center text-muted-foreground">
                        No users yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
