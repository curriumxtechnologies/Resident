// js/adminNavbar.js
import { authService } from "./authService.js";
import { clearAuthData } from "./tokenStorage.js";

export function renderAdminNavbar(activePage = "dashboard") {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "layout-dashboard", href: "admin.html" },
    { id: "users", label: "Users", icon: "users", href: "admin-users.html" },
    { id: "applications", label: "Seller Applications", icon: "briefcase", href: "admin-applications.html" },
    { id: "houses", label: "Houses", icon: "home", href: "admin-houses.html" },
  ];

  const navbar = document.createElement("nav");
  navbar.className = "bg-white shadow-sm border-b border-outline/10 sticky top-0 z-50";
  navbar.innerHTML = `
    <div class="max-w-7xl mx-auto px-5 md:px-8">
      <div class="flex items-center justify-between h-16 lg:h-20">
        <a href="admin.html" class="flex items-center gap-2">
          <img src="images/logo.png" alt="Resident" class="h-9 lg:h-11 w-auto object-contain" />
        </a>
        <div class="flex items-center gap-1 md:gap-3">
          ${navItems.map(item => `
            <a href="${item.href}" 
               class="admin-nav-link ${activePage === item.id ? 'bg-primary text-white' : 'text-on-surface-variant hover:bg-primary/10'} 
                      px-3 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2">
              <i data-lucide="${item.icon}" class="w-4 h-4"></i>
              <span class="hidden md:inline">${item.label}</span>
            </a>
          `).join('')}
          <button id="adminLogoutBtn" class="text-red-600 hover:bg-red-50 px-3 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2">
            <i data-lucide="log-out" class="w-4 h-4"></i>
            <span class="hidden md:inline">Logout</span>
          </button>
        </div>
      </div>
    </div>
  `;

  // Attach logout event after element is added to DOM
  setTimeout(() => {
    const logoutBtn = navbar.querySelector("#adminLogoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        try {
          await authService.logout();
        } catch (err) {
          console.warn("Logout failed", err);
        } finally {
          clearAuthData();
          window.location.href = "login.html";
        }
      });
    }
    // Re-init Lucide icons if available
    if (window.lucide) lucide.createIcons();
  }, 0);

  return navbar;
}