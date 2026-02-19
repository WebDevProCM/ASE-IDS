// import { verifyToken, extractToken } from "@/lib/jwt";
// import dbConnect from "@/lib/dbConnect";
// import User from "@/models/user";

// /**
//  * ROLE REFERENCE:
//  *  "admin"      → full system access
//  *  "customer"   → browse, order, invoice
//  *  "rdc_staff"  → inventory, order processing (own warehouse only)
//  *  "logistics"  → delivery assignment and tracking (own warehouse only)
//  *  "ho_manager" → reports, analytics, all warehouses (read-heavy)
//  */

// type UserRole =
//   | "admin"
//   | "customer"
//   | "rdc_staff"
//   | "logistics"
//   | "ho_manager";

// interface AuthError {
//   error: string;
//   status: number;
// }

// interface DecodedToken {
//   userId: string;
//   tokenVersion: number;
// }


// export async function requireAuth(
//   req: Request,
//   allowedRoles: UserRole[] = []
//   // eslint-disable-next-line @typescript-eslint/no-explicit-any
// ): Promise<any | AuthError> {
//   try {
//     const token = extractToken(req);
//     if (!token) {
//       return { error: "No authentication token provided", status: 401 };
//     }

//     const decoded = verifyToken(token) as DecodedToken | null;
//     if (!decoded) {
//       return { error: "Invalid or expired token", status: 401 };
//     }

//     await dbConnect();
//     const user = await User.findById(decoded.userId)
//       .populate("warehouse", "name code")
//       .populate("nearestWarehouse", "name code");

//     if (!user) {
//       return { error: "User account not found", status: 401 };
//     }

//     if (!user.isActive) {
//       return {
//         error: "Your account has been deactivated. Contact admin.",
//         status: 403,
//       };
//     }

//     if (decoded.tokenVersion !== user.tokenVersion) {
//       return { error: "Session expired. Please log in again.", status: 401 };
//     }

//     if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
//       return {
//         error: `Access denied. Required role: ${allowedRoles.join(" or ")}`,
//         status: 403,
//       };
//     }

//     return user;
//   } catch (err) {
//     console.error("Auth middleware error:", err);
//     return { error: "Authentication error", status: 500 };
//   }
// }

// // eslint-disable-next-line @typescript-eslint/no-explicit-any
// export function isAuthError(result: any): result is AuthError {
//   return result && typeof result === "object" && "error" in result;
// }

// export const requireAdmin = (req: Request) =>
//   requireAuth(req, ["admin"]);

// export const requireCustomer = (req: Request) =>
//   requireAuth(req, ["customer"]);

// export const requireRdcStaff = (req: Request) =>
//   requireAuth(req, ["rdc_staff", "admin"]);

// export const requireLogistics = (req: Request) =>
//   requireAuth(req, ["logistics", "admin"]);

// export const requireManager = (req: Request) =>
//   requireAuth(req, ["ho_manager", "admin"]);

// export const requireWarehouseStaff = (req: Request) =>
//   requireAuth(req, ["rdc_staff", "logistics", "admin"]);
