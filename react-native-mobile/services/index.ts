// Export centralisé de tous les services
export { apiRequest } from "./api";
export { AuthService } from "./authService";
export type { UserLoginRequest, UserLoginResponse } from "./authService";
export { CategoryService } from "./categoryService";
export type { Category } from "./categoryService";
export { DocumentService } from "./documentService";
export type { DocumentFile, DocumentItem } from "./documentService";
