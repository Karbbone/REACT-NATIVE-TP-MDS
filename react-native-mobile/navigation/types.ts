export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Main: undefined;
  DocumentsList: undefined;
  DocumentDetail: { id: string };
  DocumentForm: { id?: string };
  Profile: undefined; // si on expose directement l'écran profil dans le stack
  CategoriesList: undefined;
};
