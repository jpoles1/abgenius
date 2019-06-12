<template>
	<div>
		<h2>References</h2>
		<ul class="reference-list">
			<li v-for="(ref, refID) in references" :key="refID">
				<a :href="ref.url" target="_blank">
					{{ref.name}}
				</a>
			</li>
		</ul>
		<br><br>
		<h2>Other Learning Resources</h2>
		<ul class="reference-list">
			<li v-for="(ref, refID) in learningReferences" :key="refID">
				<a :href="ref.url" target="_blank">
					{{ref.name}}
				</a>
			</li>
		</ul>
	</div>
</template>

<script lang="ts">
interface ResourceData {
	name?: string;
	url?: string;
	notes?: string;
}

const referenceList: ResourceData[] = [
	{
		name: "American Thoracic Society - Guide to Interpretation of ABGs",
		url: "http://www.thoracic.org/professionals/clinical-resources/critical-care/clinical-education/abgs.php",
		notes: "Good resource to learn to quickly interpret ABGs with a stepwise algorithm",
	},
	{
		name: "Emmett, M. (2016). Approach to the patient with a negative anion gap. American Journal of Kidney Diseases, 67(1), 143-150.",
		url: "https://www.sciencedirect.com/science/article/pii/S0272638615010550",
	},
	{
		name: "Fall, P. J. (2000). A stepwise approach to acid-base disorders: practical patient evaluation for metabolic acidosis and other conditions. Postgraduate Medicine, 107(3), 249-263.",
		url: "https://www.tandfonline.com/doi/abs/10.3810/pgm.2000.03.957",
	},
	{
		name: "GlobalRPh - COMMON LABORATORY VALUES FOR ABG",
		url: "https://globalrph.com/common-laboratory-lab-values-abgs/",
		notes: "Quality set of reference ranges with lots of other great info",
	},
	{
		name: "\"Interpretation of Arterial Blood Gases.\" Pocket ICU Management, PocketMedicine.com, Inc, 2010. Anesthesia Central.",
		url: "https://anesth.unboundmedicine.com/anesthesia/view/Pocket-ICU-Management/534207/all/Interpretation_of_Arterial_Blood_Gases",
	},
	{
		name: "Kellum, J. A. (2005). Clinical review: reunification of acid–base physiology. Critical Care, 9(5), 500.",
		url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC1297616/",
	},
	{
		name: "Spencer, C., & Butler, J. (2010). Survival after cardiac arrest and severe lactic acidosis (pH 6.61) due to haemorrhage. Emergency Medicine Journal, 27(10), 800-801.",
		url: "https://emj.bmj.com/content/27/10/800.long",
	},
	{
		name: "Stolmeijer, R., Bouma, H. R., Zijlstra, J. G., Drost-de Klerck, A. M., Ter Maaten, J. C., & Ligtenberg, J. J. M. (2018). A systematic review of the effects of hyperoxia in acutely ill patients: should we aim for less?. BioMed research international, 2018.",
		url: "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5977014/",
	},
	{
		name: "Wrenn, K. (1990). The delta (Δ) gap: An approach to mixed acid-base disorders. Annals of emergency medicine, 19(11), 1310-1313.",
		url: "https://www.sciencedirect.com/science/article/pii/S0196064405822929",
	},
];

const learningReferenceList = [
	{
		name: "Baillie, J. K. (2008). Simple, easily memorised “rules of thumb” for the rapid assessment of physiological compensation for respiratory acid-base disorders. Thorax, 63(3), 289-290.",
		url: "https://thorax.bmj.com/content/63/3/289",
	},
	{
		name: "Verma, A. K., & Roach, P. (2010). The interpretation of arterial blood gases. Aust Prescr, 33(4), 124-129.",
		url: "https://www.researchgate.net/profile/Peter_Mansfield/publication/242711303_Editorial_Can_pharmaceutical_companies_contribute_to_the_quality_use_of_medicines/links/0a85e52eaf67fb5567000000/Editorial-Can-pharmaceutical-companies-contribute-to-the-quality-use-of-medicines.pdf#page=28",
	},
	{
		name: "Azad, A. K. (2016). Simple Algorithm of Arterial Blood Gas Analysis to Ensure Consistent, Correct and Quick Responses. Anesthesia & Critical Care: Open Access.",
		url: "https://medcraveonline.com/JACCOA/JACCOA-05-00199",
	},
	{
		name: "Narins, R. G., & Emmett, M (1980). Simple and mixed acid-base disorders: a practical approach. Medicine, 59(3), 161-187.",
		url: "https://journals.lww.com/md-journal/Citation/1980/05000/Simple_and_Mixed_Acid_Base_Disorders__A_Practical.1.aspx#pdf-link",
	},
];


export default {
	data() {
		return {
			references: referenceList,
			learningReferences: learningReferenceList,
		};
	},
};
</script>

<style scoped>
	.reference-list a{
		color: white;
		text-decoration: none;
		transition: 600ms;
	}
	.reference-list a:hover{
		/*color: #e7ea78;*/
		color: #f6aeae;
		text-decoration: underline;
	}
	.reference-list li{
		margin-bottom: 4px;
	}
</style>

