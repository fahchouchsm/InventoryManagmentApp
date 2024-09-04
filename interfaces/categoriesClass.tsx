import mainCategories from "../data/mainCategories.json";

export interface SubCategorieInt {
  name: string | null;
  subId: number;
}

export default class MainCategorie {
  mainCatid: number | null = null;
  catName: string | null = null;
  subCategories: SubCategorieInt[] = [];

  constructor(mainCatId: number, subCatIds: SubCategorieInt[]) {
    if (mainCatId === null) {
      throw new Error("Main Category ID is required");
    }

    this.mainCatid = mainCatId;
    this.catName = this.getCategoryNameById(mainCatId);
    this.subCategories = this.assignSubCatIds(subCatIds);
  }

  private getCategoryNameById(id: number): string | null {
    const category = mainCategories.find((cat) => cat.id === id);
    return category ? category.name : null;
  }

  private assignSubCatIds(subCategories: SubCategorieInt[]): SubCategorieInt[] {
    return subCategories.map((subCat) => {
      if (subCat.subId === null && subCat.name) {
        const foundSubCat = mainCategories.find(
          (category) =>
            category.name.toLowerCase() === subCat.name?.toLowerCase()
        );

        if (foundSubCat) {
          return { ...subCat, subId: foundSubCat.id };
        } else {
          throw new Error(`Subcategory Id Not Found for ${subCat.name}`);
        }
      }
      return subCat;
    });
  }
}
