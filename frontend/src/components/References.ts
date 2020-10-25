import CitationManager from "incite.js/src/CitationManager";
import Citation from "incite.js/src/Citation";

const mainRefs: Citation[] = [
	new Citation("ATS", {
		name: "American Thoracic Society - Guide to Interpretation of ABGs",
		url: "http://www.thoracic.org/professionals/clinical-resources/critical-care/clinical-education/abgs.php",
		notes: "Good resource to learn to quickly interpret ABGs with a stepwise algorithm",
	}),
	new Citation("Adrogue 2014", {
		name: "Adrogué, H. J., & Madias, N. E. (2014). Respiratory acidosis, respiratory alkalosis, and mixed disorders. Comprehensive Clinical Nephrology E-Book, 169.",
		url: "https://www.sciencedirect.com/science/article/pii/B9780323058766000149",
	}),
	new Citation("Brinkman & Sharma 2019", {
		name: "Brinkman, J. E., & Sharma, S. (2019). Physiology, Respiratory Alkalosis. In StatPearls [Internet]. StatPearls Publishing.",
		url: "https://www.ncbi.nlm.nih.gov/books/NBK482117/",
	}),
	new Citation("Emmett 2016", {
		name: "Emmett, M. (2016). Approach to the patient with a negative anion gap. American Journal of Kidney Diseases, 67(1), 143-150.",
		url: "https://www.sciencedirect.com/science/article/pii/S0272638615010550",
	}),
	new Citation("Fall 2000", {
		name: "Fall, P. J. (2000). A stepwise approach to acid-base disorders: practical patient evaluation for metabolic acidosis and other conditions. Postgraduate Medicine, 107(3), 249-263.",
		url: "https://www.tandfonline.com/doi/abs/10.3810/pgm.2000.03.957",
	}),
	new Citation("GlobalRPh", {
		name: "GlobalRPh - COMMON LABORATORY VALUES FOR ABG",
		url: "https://globalrph.com/common-laboratory-lab-values-abgs/",
		notes: "Quality set of reference ranges with lots of other great info",
	}),
	new Citation("Hamm 2015", {
		name: "Hamm, L. L., Nakhoul, N., & Hering-Smith, K. S. (2015). Acid-base homeostasis. Clinical Journal of the American Society of Nephrology, 10(12), 2232-2242.",
		url: "https://cjasn.asnjournals.org/content/10/12/2232",
	}),
	new Citation("Kellum 2005", {
		name: "Kellum, J. A. (2005). Clinical review: reunification of acid–base physiology. Critical Care, 9(5), 500.",
		url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1297616/",
	}),
	new Citation("Mehta 2008", {
		name: "Mehta, A. N., Emmett, J. B., & Emmett, M. (2008). GOLD MARK: an anion gap mnemonic for the 21st century. The lancet, 372(9642), 892.",
		url: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(08)61398-7/fulltext",
	}),
	new Citation("Narins 1980", {
		name: "Narins, R. G., & Emmett, M (1980). Simple and mixed acid-base disorders: a practical approach. Medicine, 59(3), 161-187.",
		url: "https://journals.lww.com/md-journal/Citation/1980/05000/Simple_and_Mixed_Acid_Base_Disorders__A_Practical.1.aspx#pdf-link",
	}),
	new Citation("Pocket ICU", {
		name: "\"Interpretation of Arterial Blood Gases.\" Pocket ICU Management, PocketMedicine.com, Inc, 2010. Anesthesia Central.",
		url: "https://anesth.unboundmedicine.com/anesthesia/view/Pocket-ICU-Management/534207/all/Interpretation_of_Arterial_Blood_Gases",
	}),
	new Citation("Patel & Sharma 2019", {
		name: "Patel, S., & Sharma, S. (2019). Physiology, Respiratory Acidosis. In StatPearls [Internet]. StatPearls Publishing.",
		url: "https://www.ncbi.nlm.nih.gov/books/NBK482430/",
	}),
	new Citation("Sofier & Kim 2014", {
		name: "Soifer, J. T., & Kim, H. T. (2014). Approach to metabolic alkalosis. Emergency Medicine Clinics, 32(2), 453-463.",
		url: "https://www.ncbi.nlm.nih.gov/pubmed/24766943",
	}),
	new Citation("Spencer & Butler 2010", {
		name: "Spencer, C., & Butler, J. (2010). Survival after cardiac arrest and severe lactic acidosis (pH 6.61) due to haemorrhage. Emergency Medicine Journal, 27(10), 800-801.",
		url: "https://emj.bmj.com/content/27/10/800.long",
	}),
	new Citation("Stolmeijer 2018", {
		name: "Stolmeijer, R., Bouma, H. R., Zijlstra, J. G., Drost-de Klerck, A. M., Ter Maaten, J. C., & Ligtenberg, J. J. M. (2018). A systematic review of the effects of hyperoxia in acutely ill patients: should we aim for less?. BioMed research international, 2018.",
		url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5977014/",
	}),
	new Citation("Wrenn 1990", {
		name: "Wrenn, K. (1990). The delta (Δ) gap: An approach to mixed acid-base disorders. Annals of emergency medicine, 19(11), 1310-1313.",
		url: "https://www.sciencedirect.com/science/article/pii/S0196064405822929",
	}),
];

const extraRefs = [
	new Citation("Baillie 2008", {
		name: "Baillie, J. K. (2008). Simple, easily memorised “rules of thumb” for the rapid assessment of physiological compensation for respiratory acid-base disorders. Thorax, 63(3), 289-290.",
		url: "https://thorax.bmj.com/content/63/3/289",
	}),
	new Citation("Verma 2010", {
		name: "Verma, A. K., & Roach, P. (2010). The interpretation of arterial blood gases. Aust Prescr, 33(4), 124-129.",
		url: "https://www.researchgate.net/profile/Peter_Mansfield/publication/242711303_Editorial_Can_pharmaceutical_companies_contribute_to_the_quality_use_of_medicines/links/0a85e52eaf67fb5567000000/Editorial-Can-pharmaceutical-companies-contribute-to-the-quality-use-of-medicines.pdf#page=28",
	}),
	new Citation("Azad 2016", {
		name: "Azad, A. K. (2016). Simple Algorithm of Arterial Blood Gas Analysis to Ensure Consistent, Correct and Quick Responses. Anesthesia & Critical Care: Open Access.",
		url: "https://medcraveonline.com/JACCOA/JACCOA-05-00199",
	}),
	new Citation("Albert 1967", {
		name: "Albert, M. S., Dell, R. B., & Winters, R. W. (1967). Quantitative displacement of acid-base equilibrium in metabolic acidosis. Annals of internal medicine, 66(2), 312-322.",
		url: "https://annals.org/aim/fullarticle/681186/quantitative-displacement-acid-base-equilibrium-metabolic-acidosis",
	}),
	new Citation("Nickson 2019", {
		name: "Nickson, C. (2019, April 23). Normal Anion Gap Metabolic Acidosis. litfl.com",
		url: "https://litfl.com/normal-anion-gap-metabolic-acidosis/",
	}),
];

export const MainRefManager = new CitationManager(mainRefs);
export const ExtraRefManager = new CitationManager(extraRefs);
