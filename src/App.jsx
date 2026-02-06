import { useEffect, useState } from "react";
import { api } from "./api";

export default function App() {
  // ✅ Start always at login (no localStorage session)
  const [auth, setAuth] = useState(null); // { token, user: { id, email, role } }
  const token = auth?.token;
  const role = auth?.user?.role;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [view, setView] = useState("login"); // login | admin | student
  const [adminTab, setAdminTab] = useState("courses"); // courses | users

  // Courses
  const [courses, setCourses] = useState([]);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [editingCourseId, setEditingCourseId] = useState(null);
  const [editCourseName, setEditCourseName] = useState("");
  const [editCourseType, setEditCourseType] = useState("");

  // Student
  const [myCourses, setMyCourses] = useState([]);

  // Users (Admin)
  const [users, setUsers] = useState([]);
  const [uEmail, setUEmail] = useState("");
  const [uPassword, setUPassword] = useState("");
  const [uRole, setURole] = useState("user");
  const [uFirst, setUFirst] = useState("");
  const [uLast, setULast] = useState("");
  const [uBirth, setUBirth] = useState("");
  const [uPrevEdu, setUPrevEdu] = useState("");
  const [uAvg, setUAvg] = useState("");

  const [editingUserId, setEditingUserId] = useState(null);
  const [editUEmail, setEditUEmail] = useState("");
  const [editURole, setEditURole] = useState("user");
  const [editUFirst, setEditUFirst] = useState("");
  const [editULast, setEditULast] = useState("");
  const [editUBirth, setEditUBirth] = useState("");
  const [editUPrevEdu, setEditUPrevEdu] = useState("");
  const [editUAvg, setEditUAvg] = useState("");

  const [resetPwUserId, setResetPwUserId] = useState(null);
  const [resetPw, setResetPw] = useState("");

  // --- helpers ---
  function handleAuthError(err) {
    if (err?.message === "Invalid token" || err?.message === "No token provided") {
      setAuth(null);
      setView("login");
      setAdminTab("courses");
      return true;
    }
    return false;
  }

  // --- view switching based on auth ---
  useEffect(() => {
    if (!auth?.token) {
      setView("login");
      return;
    }
    setView(auth?.user?.role === "admin" ? "admin" : "student");
  }, [auth]);

  // --- login/logout ---
  async function login(e) {
    e.preventDefault();
    try {
      const data = await api("/api/auth/login", {
        method: "POST",
        body: { email, password },
      });

      setAuth(data);
      setEmail("");
      setPassword("");
      setView(data.user.role === "admin" ? "admin" : "student");
      setAdminTab("courses");
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(err.message);
    }
  }

  function logout() {
    setAuth(null);
    setView("login");
    setAdminTab("courses");
    setEmail("");
    setPassword("");
  }

  // --- loaders ---
  async function loadCourses() {
    const data = await api("/api/courses", { token });
    setCourses(data);
  }

  async function loadUsers() {
    const data = await api("/api/users", { token });
    setUsers(data);
  }

  async function loadMyCourses() {
    // ⚠️ if your backend uses a different endpoint, change here
    const data = await api("/api/my-courses", { token });
    setMyCourses(data);
  }

  // Load data after token/role is available
  useEffect(() => {
    if (!token) return;

    loadCourses().catch(() => {});
    loadMyCourses().catch(() => {});
    if (role === "admin") loadUsers().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, role]);

  // --- Courses CRUD ---
  async function createCourse() {
    try {
      await api("/api/courses", { method: "POST", token, body: { name, type } });
      setName("");
      setType("");
      await loadCourses();
      alert("Course created ✅");
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(err.message);
    }
  }

  function startEditCourse(c) {
    setEditingCourseId(c.id);
    setEditCourseName(c.name || "");
    setEditCourseType(c.type || "");
  }

  function cancelEditCourse() {
    setEditingCourseId(null);
    setEditCourseName("");
    setEditCourseType("");
  }

  async function saveEditCourse(id) {
    try {
      await api(`/api/courses/${id}`, {
        method: "PUT",
        token,
        body: { name: editCourseName, type: editCourseType },
      });
      cancelEditCourse();
      await loadCourses();
      alert("Course updated ✅");
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(err.message);
    }
  }

  async function deleteCourse(id) {
    try {
      await api(`/api/courses/${id}`, { method: "DELETE", token });
      await loadCourses();
      alert("Course deleted ✅");
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(err.message);
    }
  }

  // --- Student ---
  async function enroll(courseId) {
    try {
      await api(`/api/courses/${courseId}/enroll`, { method: "POST", token });
      await loadMyCourses();
      alert("Enrolled ✅");
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(err.message);
    }
  }

  // --- Users CRUD (Admin) ---
  async function createUser() {
    try {
      await api("/api/users", {
        method: "POST",
        token,
        body: {
          email: uEmail,
          password: uPassword,
          role: uRole,
          first_name: uFirst,
          last_name: uLast,
          birth_date: uBirth || null,
          previous_education: uPrevEdu,
          average_grade: uAvg === "" ? null : Number(uAvg),
        },
      });

      setUEmail("");
      setUPassword("");
      setURole("user");
      setUFirst("");
      setULast("");
      setUBirth("");
      setUPrevEdu("");
      setUAvg("");

      await loadUsers();
      alert("User created ✅");
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(err.message);
    }
  }

  function startEditUser(u) {
    setEditingUserId(u.id);
    setEditUEmail(u.email || "");
    setEditURole(u.role || "user");
    setEditUFirst(u.first_name || "");
    setEditULast(u.last_name || "");
    setEditUBirth(u.birth_date ? String(u.birth_date).slice(0, 10) : "");
    setEditUPrevEdu(u.previous_education || "");
    setEditUAvg(u.average_grade == null ? "" : String(u.average_grade));
  }

  function cancelEditUser() {
    setEditingUserId(null);
    setEditUEmail("");
    setEditURole("user");
    setEditUFirst("");
    setEditULast("");
    setEditUBirth("");
    setEditUPrevEdu("");
    setEditUAvg("");
  }

  async function saveEditUser(id) {
    try {
      await api(`/api/users/${id}`, {
        method: "PUT",
        token,
        body: {
          email: editUEmail,
          role: editURole,
          first_name: editUFirst,
          last_name: editULast,
          birth_date: editUBirth || null,
          previous_education: editUPrevEdu,
          average_grade: editUAvg === "" ? null : Number(editUAvg),
        },
      });
      cancelEditUser();
      await loadUsers();
      alert("User updated ✅");
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(err.message);
    }
  }

  async function deleteUser(id) {
    try {
      await api(`/api/users/${id}`, { method: "DELETE", token });
      await loadUsers();
      alert("User deleted ✅");
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(err.message);
    }
  }

  async function resetUserPassword(id) {
    try {
      await api(`/api/users/${id}/password`, {
        method: "PUT",
        token,
        body: { password: resetPw },
      });
      setResetPwUserId(null);
      setResetPw("");
      alert("Password reset ✅");
    } catch (err) {
      if (handleAuthError(err)) return;
      alert(err.message);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "40px auto", fontFamily: "system-ui" }}>
      <h2>Smart University</h2>

      {view === "login" ? (
        <form
          onSubmit={login}
          style={{ border: "1px solid #ddd", padding: 16, borderRadius: 10, maxWidth: 520 }}
        >
          <h3>Login</h3>
          <div style={{ display: "grid", gap: 10 }}>
            <label>
              Email
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </label>
            <button style={{ padding: 10 }}>Login</button>
          </div>
        </form>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <b>
                {`${auth?.user?.first_name || ""} ${auth?.user?.last_name || ""}`.trim() || auth?.user?.email}
              </b>{" "}
              | <b>Role:</b> {role}
            </div>
            <button onClick={logout} style={{ padding: 8 }}>
              Logout
            </button>
          </div>

          {view === "admin" ? (
            <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 10 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <button onClick={() => setAdminTab("courses")} style={{ padding: 8 }}>
                  Courses
                </button>
                <button
                  onClick={() => {
                    setAdminTab("users");
                    if (token) loadUsers();
                  }}
                  style={{ padding: 8 }}
                >
                  Users
                </button>
                <button
                  onClick={() => {
                    if (!token) return;
                    loadCourses();
                    if (adminTab === "users") loadUsers();
                  }}
                  style={{ padding: 8 }}
                >
                  Refresh
                </button>
              </div>

              {adminTab === "courses" ? (
                <>
                  <h3 style={{ marginTop: 0 }}>Admin — Courses CRUD</h3>

                  <h4>Create Course</h4>
                  <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
                    <input
                      placeholder="Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ padding: 8 }}
                    />
                    <input
                      placeholder="Type"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      style={{ padding: 8 }}
                    />
                    <button type="button" onClick={createCourse} style={{ padding: 10 }}>
                      Create
                    </button>
                  </div>

                  <h4>Courses</h4>
                  <ul style={{ paddingLeft: 18 }}>
                    {courses.map((c) => (
                      <li key={c.id} style={{ marginBottom: 10 }}>
                        {editingCourseId === c.id ? (
                          <>
                            <input
                              value={editCourseName}
                              onChange={(e) => setEditCourseName(e.target.value)}
                              style={{ padding: 6, marginRight: 8 }}
                            />
                            <input
                              value={editCourseType}
                              onChange={(e) => setEditCourseType(e.target.value)}
                              style={{ padding: 6, marginRight: 8 }}
                            />
                            <button onClick={() => saveEditCourse(c.id)} style={{ marginRight: 6 }}>
                              Save
                            </button>
                            <button onClick={cancelEditCourse}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <b>{c.name}</b> — {c.type}
                            <button onClick={() => startEditCourse(c)} style={{ marginLeft: 10, marginRight: 6 }}>
                              Edit
                            </button>
                            <button onClick={() => deleteCourse(c.id)}>Delete</button>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <>
                  <h3 style={{ marginTop: 0 }}>Admin — Users CRUD</h3>

                  <h4>Create User</h4>
                  <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr", maxWidth: 900 }}>
                    <input
                      placeholder="Email"
                      value={uEmail}
                      onChange={(e) => setUEmail(e.target.value)}
                      style={{ padding: 8 }}
                    />
                    <input
                      placeholder="Password"
                      value={uPassword}
                      onChange={(e) => setUPassword(e.target.value)}
                      style={{ padding: 8 }}
                    />
                    <select value={uRole} onChange={(e) => setURole(e.target.value)} style={{ padding: 8 }}>
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                    <input
                      placeholder="First name"
                      value={uFirst}
                      onChange={(e) => setUFirst(e.target.value)}
                      style={{ padding: 8 }}
                    />
                    <input
                      placeholder="Last name"
                      value={uLast}
                      onChange={(e) => setULast(e.target.value)}
                      style={{ padding: 8 }}
                    />
                    <input type="date" value={uBirth} onChange={(e) => setUBirth(e.target.value)} style={{ padding: 8 }} />
                    <input
                      placeholder="Previous education"
                      value={uPrevEdu}
                      onChange={(e) => setUPrevEdu(e.target.value)}
                      style={{ padding: 8 }}
                    />
                    <input
                      placeholder="Average grade"
                      value={uAvg}
                      onChange={(e) => setUAvg(e.target.value)}
                      style={{ padding: 8 }}
                    />
                  </div>
                  <button type="button" onClick={createUser} style={{ padding: 10, marginTop: 10 }}>
                    Create User
                  </button>

                  <h4 style={{ marginTop: 20 }}>Users</h4>
                  <ul style={{ paddingLeft: 18 }}>
                    {users.map((u) => (
                      <li key={u.id} style={{ marginBottom: 12 }}>
                        {editingUserId === u.id ? (
                          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "1fr 1fr" }}>
                            <input value={editUEmail} onChange={(e) => setEditUEmail(e.target.value)} style={{ padding: 8 }} />
                            <select value={editURole} onChange={(e) => setEditURole(e.target.value)} style={{ padding: 8 }}>
                              <option value="user">user</option>
                              <option value="admin">admin</option>
                            </select>
                            <input placeholder="First name" value={editUFirst} onChange={(e) => setEditUFirst(e.target.value)} style={{ padding: 8 }} />
                            <input placeholder="Last name" value={editULast} onChange={(e) => setEditULast(e.target.value)} style={{ padding: 8 }} />
                            <input type="date" value={editUBirth} onChange={(e) => setEditUBirth(e.target.value)} style={{ padding: 8 }} />
                            <input placeholder="Previous education" value={editUPrevEdu} onChange={(e) => setEditUPrevEdu(e.target.value)} style={{ padding: 8 }} />
                            <input placeholder="Average grade" value={editUAvg} onChange={(e) => setEditUAvg(e.target.value)} style={{ padding: 8 }} />

                            <div style={{ gridColumn: "1 / -1" }}>
                              <button onClick={() => saveEditUser(u.id)} style={{ marginRight: 8 }}>
                                Save
                              </button>
                              <button onClick={cancelEditUser}>Cancel</button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <b>{u.email}</b> — role: <b>{u.role}</b>
                            {u.first_name || u.last_name ? ` | ${u.first_name || ""} ${u.last_name || ""}` : ""}

                            <button onClick={() => startEditUser(u)} style={{ marginLeft: 10, marginRight: 6 }}>
                              Edit
                            </button>
                            <button onClick={() => deleteUser(u.id)} style={{ marginRight: 6 }}>
                              Delete
                            </button>
                            <button onClick={() => { setResetPwUserId(u.id); setResetPw(""); }}>
                              Reset Password
                            </button>

                            {resetPwUserId === u.id ? (
                              <div style={{ marginTop: 8 }}>
                                <input
                                  placeholder="New password"
                                  value={resetPw}
                                  onChange={(e) => setResetPw(e.target.value)}
                                  style={{ padding: 8, marginRight: 8 }}
                                />
                                <button onClick={() => resetUserPassword(u.id)} style={{ marginRight: 6 }}>
                                  Save
                                </button>
                                <button onClick={() => { setResetPwUserId(null); setResetPw(""); }}>
                                  Cancel
                                </button>
                              </div>
                            ) : null}
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ) : (
            <div style={{ border: "1px solid #ddd", padding: 16, borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ margin: 0 }}>Student Panel</h3>
                <button onClick={() => { loadCourses(); loadMyCourses(); }} style={{ padding: 8 }}>
                  Refresh
                </button>
              </div>

              <h4>All Courses</h4>
              <ul style={{ paddingLeft: 18 }}>
                {courses.map((c) => (
                  <li key={c.id} style={{ marginBottom: 8 }}>
                    <b>{c.name}</b> — {c.type}
                    <button onClick={() => enroll(c.id)} style={{ marginLeft: 10 }}>
                      Enroll
                    </button>
                  </li>
                ))}
              </ul>

              <h4>My Courses</h4>
              <ul style={{ paddingLeft: 18 }}>
                {myCourses.map((c) => (
                  <li key={c.id}>
                    <b>{c.name}</b> — {c.type}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
