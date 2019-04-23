<template>
    <div>
        <h2>References</h2>
        <ul>
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
];


export default {
    data() {
        return {
            references: referenceList,
        };
    },
};
</script>

