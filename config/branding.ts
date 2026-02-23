export interface BrandingConfig {
  schoolName: string;
  logo: any;
  primaryColor: string;
}

export const defaultBranding: BrandingConfig = {
  schoolName: "Krishnakant Public School",
  logo: require("../assets/images/school-logo-1024.png"),
  primaryColor: "#1E88E5",
};
