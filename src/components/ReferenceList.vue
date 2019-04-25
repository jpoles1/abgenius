<template>
    <div>
        <h2>References</h2>
        <ul id="reference-list">
            <li v-for="(ref, refID) in references" :key="refID">
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
        name: 'American Thoracic Society - Guide to Interpretation of ABGs',
        url: 'http://www.thoracic.org/professionals/clinical-resources/critical-care/clinical-education/abgs.php',
        notes: 'Good resource to learn to quickly interpret ABGs with a stepwise algorithm',
    },
    {
        name: 'GlobalRPh - COMMON LABORATORY VALUES FOR ABG',
        url: 'https://globalrph.com/common-laboratory-lab-values-abgs/',
        notes: 'Quality set of reference ranges with lots of other great info',
    },
    {
        name: 'Fall, P. J. (2000). A stepwise approach to acid-base disorders: practical patient evaluation for metabolic acidosis and other conditions. Postgraduate Medicine, 107(3), 249-263.',
        url: 'https://www.tandfonline.com/doi/abs/10.3810/pgm.2000.03.957',
    },
    {
        name: 'Verma, A. K., & Roach, P. (2010). The interpretation of arterial blood gases. Aust Prescr, 33(4), 124-129.',
        url: 'https://www.researchgate.net/profile/Peter_Mansfield/publication/242711303_Editorial_Can_pharmaceutical_companies_contribute_to_the_quality_use_of_medicines/links/0a85e52eaf67fb5567000000/Editorial-Can-pharmaceutical-companies-contribute-to-the-quality-use-of-medicines.pdf#page=28',
    },
    {
        name: 'Azad, A. K. (2016). Simple Algorithm of Arterial Blood Gas Analysis to Ensure Consistent, Correct and Quick Responses. Anesthesia & Critical Care: Open Access.',
        url: 'https://medcraveonline.com/JACCOA/JACCOA-05-00199',
    },
    {
        name: 'Narins, R. G., & Emmett, M (1980). Simple and mixed acid-base disorders: a practical approach. Medicine, 59(3), 161-187.',
        url: 'https://journals.lww.com/md-journal/Citation/1980/05000/Simple_and_Mixed_Acid_Base_Disorders__A_Practical.1.aspx#pdf-link',
    },
];


export default {
    data() {
        return {
            references: referenceList,
        };
    },
};
</script>

<style scoped>
    #reference-list a{
        color: white;
        text-decoration: none;
        transition: 600ms;
    }
    #reference-list a:hover{
        color: #e7ea78;
        text-decoration: underline;
    }
    #reference-list li{
        margin-bottom: 4px;
    }
</style>

