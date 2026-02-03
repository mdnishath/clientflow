import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const USER_EMAIL = "demo@clientflow.local";

// Templates: 30 x 1-line, 40 x 2-line, 30 x 3-line = 100 total
// ~10% have {business_name}
const TEMPLATES_1LINE = [
    "Travail de toiture impeccable, je recommande vivement !",
    "Excellente intervention sur ma toiture, très satisfait.",
    "Équipe professionnelle et travail soigné, merci !",
    "Réparation rapide et efficace de ma toiture.",
    "Service impeccable pour la rénovation de mon toit.",
    "Très bon rapport qualité-prix pour les travaux.",
    "Couvreurs compétents et respectueux des délais.",
    "Je recommande {business_name} sans hésitation !",
    "Travail propre et professionnel sur mon toit.",
    "Intervention rapide après la tempête, merci !",
    "Toiture refaite à neuf, résultat parfait.",
    "Excellents conseils et réalisation impeccable.",
    "Prix raisonnable et qualité au rendez-vous.",
    "Très satisfait de la pose des tuiles.",
    "Équipe sérieuse et travail bien fait.",
    "Réparation de fuite résolue rapidement.",
    "Service client réactif et professionnel.",
    "Travaux réalisés dans les temps, parfait !",
    "Artisans qualifiés et travail de qualité.",
    "Je suis très content du résultat final.",
    "Devis clair et travail conforme.",
    "Toiture neuve magnifique, merci beaucoup !",
    "Professionnels à l'écoute des besoins.",
    "Excellent travail de zinguerie également.",
    "Chantier propre et bien organisé.",
    "Pose de velux parfaitement réalisée.",
    "Isolation de toiture très bien faite.",
    "Merci pour ce travail remarquable !",
    "Couvreurs expérimentés et efficaces.",
    "Je ferai appel à eux à nouveau.",
];

const TEMPLATES_2LINE = [
    "Excellente entreprise de couverture. Travail soigné et équipe très professionnelle qui a su répondre à toutes mes attentes.",
    "Rénovation complète de ma toiture effectuée rapidement. Je suis très satisfait du résultat et du respect des délais annoncés.",
    "Intervention suite à des infiltrations d'eau. Le problème a été identifié et résolu efficacement, plus aucune fuite depuis.",
    "J'ai fait appel à {business_name} pour refaire mon toit. Travail impeccable et équipe très agréable, je recommande vivement.",
    "Pose de nouvelles tuiles sur ma maison ancienne. Le résultat est magnifique et respecte parfaitement le style architectural.",
    "Devis détaillé et transparent, aucune surprise. Les travaux ont été réalisés exactement comme prévu, très professionnel.",
    "Équipe ponctuelle et respectueuse de ma propriété. Le chantier a été laissé propre chaque soir, très appréciable.",
    "Réparation urgente après la grêle très bien gérée. Intervention rapide et travail de qualité pour réparer les dégâts.",
    "Isolation de toiture par l'extérieur parfaitement réalisée. Je constate déjà une amélioration du confort thermique chez moi.",
    "Installation de gouttières en zinc de qualité. Finitions soignées et travail durable, très satisfait du rendu final.",
    "Couvreur très compétent et de bon conseil. Il m'a guidé dans le choix des matériaux adaptés à ma région.",
    "Travaux de zinguerie et couverture combinés. Tout a été fait en une seule intervention, gain de temps appréciable.",
    "Réfection complète avec garantie décennale. Cela me rassure pour les années à venir, entreprise sérieuse et fiable.",
    "Prix compétitif par rapport aux autres devis. La qualité est au rendez-vous, excellent rapport qualité-prix.",
    "Pose de fenêtres de toit Velux impeccable. Luminosité parfaite maintenant dans mes combles, travail très propre.",
    "Nettoyage et traitement de toiture efficace. Mon toit a retrouvé son aspect d'origine, très beau résultat.",
    "Démoussage complet suivi d'un traitement hydrofuge. Ma toiture est maintenant protégée pour plusieurs années.",
    "Étanchéité de toit terrasse parfaitement réalisée. Aucun problème d'infiltration depuis les travaux, excellent travail.",
    "Remplacement de faîtage en urgence bien géré. L'équipe est intervenue rapidement malgré les intempéries.",
    "Travail minutieux sur ma toiture en ardoise. Le savoir-faire artisanal est visible, résultat remarquable.",
    "Conseils avisés pour le choix des tuiles. L'entreprise connaît bien les spécificités régionales, très pro.",
    "Rénovation de charpente et couverture combinées. Coordination parfaite entre les différents corps de métier.",
    "Entreprise recommandée par mon architecte. Je comprends pourquoi maintenant, travail de grande qualité.",
    "Suivi de chantier régulier et communication claire. J'étais informé de l'avancement à chaque étape.",
    "Travaux réalisés malgré la météo difficile. L'équipe s'est adaptée et a livré dans les temps.",
    "Respect total du voisinage pendant les travaux. Aucune plainte des voisins, chantier bien géré.",
    "Facture conforme au devis initial signé. Aucun supplément caché, entreprise honnête et transparente.",
    "Pose d'écran sous toiture très professionnelle. Protection optimale contre les infiltrations maintenant.",
    "Réparation de cheminée incluse dans les travaux. Service complet et pratique, tout en une fois.",
    "Matériaux de qualité utilisés pour mon toit. On voit la différence avec un travail bas de gamme.",
    "Artisan certifié RGE pour les aides. Cela m'a permis de bénéficier des subventions disponibles.",
    "Travail sur bâtiment classé bien maîtrisé. Respect des contraintes architecturales, résultat conforme.",
    "Je recommande {business_name} pour leur sérieux. Entreprise locale de confiance avec une bonne réputation.",
    "Couverture en tuiles mécaniques parfaite. Alignement impeccable et finitions soignées sur tout le toit.",
    "Intervention pour fuite nocturne en urgence. Disponibilité appréciée dans les moments critiques.",
    "Nettoyage des débris après travaux impeccable. Le jardin était nickel après leur départ.",
    "Garantie et SAV rassurants proposés. Je sais que je peux compter sur eux si besoin.",
    "Équipe formée aux techniques modernes. Utilisation d'équipements professionnels et sécurisés.",
    "Diagnostic toiture gratuit très utile. Cela m'a permis de prioriser les travaux nécessaires.",
    "Travaux éligibles aux aides de l'État. L'entreprise m'a aidé dans les démarches administratives.",
];

const TEMPLATES_3LINE = [
    "J'ai fait refaire entièrement ma toiture par cette entreprise et je suis extrêmement satisfait du résultat. L'équipe a été très professionnelle du début à la fin, respectant les délais annoncés. Je recommande vivement leurs services pour tous travaux de couverture.",
    "Suite à une tempête, ma toiture était très endommagée et j'avais besoin d'une intervention urgente. L'équipe est venue rapidement évaluer les dégâts et a commencé les réparations immédiatement. Travail de qualité et service client irréprochable.",
    "Rénovation complète de la toiture de ma maison de 1950, un vrai challenge relevé avec brio. Les artisans ont su adapter les techniques aux contraintes du bâti ancien. Résultat magnifique qui respecte l'authenticité de la maison.",
    "Excellente expérience avec {business_name} pour l'isolation de mes combles par l'extérieur. Le confort thermique s'est nettement amélioré et mes factures de chauffage ont diminué. Investissement rentabilisé et équipe très compétente.",
    "Pose de panneaux solaires intégrés à ma toiture réalisée avec expertise et passion. L'entreprise a géré l'ensemble du projet, de l'étude technique à la mise en service. Je produis maintenant ma propre électricité grâce à leur travail.",
    "Changement complet des gouttières et descentes en zinc naturel sur toute la maison. Le travail de zinguerie est remarquable, avec des soudures invisibles et des finitions parfaites. Ma façade est maintenant bien protégée.",
    "J'ai comparé plusieurs devis avant de choisir cette entreprise pour refaire mon toit. Leur rapport qualité-prix était le meilleur et le résultat final confirme mon choix. Travail soigné, équipe agréable et respect des délais.",
    "Traitement complet de ma toiture : nettoyage haute pression, démoussage et application d'un hydrofuge. Ma toiture a retrouvé son aspect d'origine et est protégée pour les années à venir. Très belle prestation.",
    "Installation de trois fenêtres de toit Velux dans mes combles aménageables réalisée parfaitement. La luminosité est transformée et l'étanchéité est impeccable malgré les fortes pluies récentes. Excellent travail d'artisan.",
    "Réfection totale de ma toiture en ardoise naturelle, un savoir-faire rare et précieux. Chaque ardoise a été posée avec soin selon les règles de l'art traditionnelles. Le résultat est absolument magnifique.",
    "Création d'une lucarne de toit pour agrandir l'espace habitable de mes combles. Le travail structurel et la couverture ont été réalisés avec une grande maîtrise. J'ai gagné une pièce lumineuse et fonctionnelle.",
    "Entreprise très sérieuse qui a su gérer un chantier complexe de rénovation énergétique globale. Toiture, isolation et ventilation ont été traités ensemble pour un résultat optimal. Ma maison est maintenant bien plus économe.",
    "Réparation d'une charpente endommagée par les termites combinée avec la réfection de la couverture. Le diagnostic était inquiétant mais l'équipe a tout remis en état. Ma maison est maintenant saine et protégée.",
    "Travaux de couverture sur ma résidence secondaire gérés à distance sans problème. Communication régulière par photos et appels, j'étais informé de chaque étape. Résultat conforme à mes attentes malgré l'éloignement.",
    "Je recommande vivement {business_name} pour leur professionnalisme exemplaire sur mon chantier. Du premier contact à la réception des travaux, tout a été parfait. Artisans qualifiés et service client au top.",
    "Pose d'une toiture végétalisée sur mon extension réalisée avec expertise et passion. L'équipe maîtrisait parfaitement cette technique écologique encore peu répandue. Résultat esthétique et écologique remarquable.",
    "Intervention sur le toit de mon immeuble en copropriété gérée efficacement. L'entreprise a su coordonner les travaux avec le syndic et les résidents. Chantier mené dans les règles de l'art.",
    "Rénovation de ma toiture avec récupération et réemploi des tuiles anciennes encore bonnes. Démarche écologique appréciable et économie réalisée sur les matériaux. Entreprise engagée et compétente.",
    "Étude thermique complète avant travaux pour optimiser l'isolation de ma toiture. Les préconisations étaient pertinentes et les travaux conformes au diagnostic. Confort amélioré et factures réduites.",
    "Couverture en bac acier pour mon hangar agricole réalisée dans les délais serrés. L'équipe a travaillé efficacement malgré les contraintes de mon exploitation. Bâtiment maintenant bien protégé.",
    "Surélévation de toiture pour créer un étage supplémentaire menée de main de maître. Projet ambitieux parfaitement réalisé, j'ai doublé ma surface habitable. Travail remarquable sur tous les plans.",
    "Remplacement de ma couverture amiante en toute sécurité et conformité. L'entreprise est certifiée pour ce type de désamiantage délicat. Travaux réalisés proprement et en toute légalité.",
    "Installation d'une VMC intégrée lors de la réfection de ma toiture très bien pensée. Ventilation optimale maintenant dans toute la maison. Approche globale appréciée pour un résultat durable.",
    "Travaux de toiture et ravalement de façade coordonnés parfaitement. Un seul interlocuteur pour gérer l'ensemble, très pratique et efficace. Ma maison a été entièrement rénovée en extérieur.",
    "Pose de capteurs solaires thermiques intégrés à ma couverture sans souci. L'esthétique est préservée et l'installation fonctionne parfaitement. Eau chaude gratuite grâce au soleil maintenant.",
    "Réparation complexe sur toiture terrasse accessible avec création d'une étanchéité durable. Zone technique maintenant accessible et fonctionnelle sans risque d'infiltration. Expertise technique évidente.",
    "Chantier de couverture mené en hiver avec toutes les précautions nécessaires. L'équipe a protégé l'intérieur de la maison pendant les travaux. Aucune infiltration ni dégât malgré la météo.",
    "Modernisation de ma toiture avec intégration de panneaux photovoltaïques discrets. Production d'électricité optimale et esthétique préservée. Investissement pour l'avenir bien accompagné.",
    "Couverture de piscine avec toiture amovible réalisée sur mesure pour mon projet. Solution technique innovante parfaitement exécutée. Je peux profiter de ma piscine toute l'année maintenant.",
    "Extension de maison avec toiture plate parfaitement raccordée à l'existant. Pas de différence visible entre l'ancien et le nouveau. Travail d'intégration remarquable par des pros.",
];

// 200 contexts
const CONTEXTS = [
    "Remplacement complet de la toiture en tuiles",
    "Réparation de fuites après forte pluie",
    "Rénovation toiture maison ancienne",
    "Installation de fenêtres de toit Velux",
    "Pose de gouttières en zinc",
    "Traitement anti-mousse sur toiture",
    "Réfection de la zinguerie complète",
    "Isolation de toiture par l'extérieur",
    "Remplacement des tuiles cassées",
    "Nettoyage haute pression du toit",
    "Pose d'un écran sous toiture",
    "Réparation de charpente endommagée",
    "Installation de panneaux solaires",
    "Étanchéité toit terrasse",
    "Rénovation toiture en ardoise",
    "Changement de faîtage",
    "Pose de chatières de ventilation",
    "Réparation suite à tempête",
    "Démoussage et hydrofuge",
    "Création d'une lucarne",
    "Surélévation de toiture",
    "Réfection après grêle",
    "Installation VMC en toiture",
    "Pose de tuiles mécaniques",
    "Rénovation cheminée",
    "Traitement bois de charpente",
    "Pose de bac acier",
    "Isolation combles perdus",
    "Réparation descentes pluviales",
    "Création sortie de toit",
    "Pose de membrane EPDM",
    "Rénovation toiture végétalisée",
    "Installation pare-neige",
    "Remplacement solin cheminée",
    "Étanchéité autour Velux",
    "Pose de closoirs ventilés",
    "Réparation noue de toit",
    "Changement des rives",
    "Installation ligne de vie",
    "Réfection toiture église",
    "Couverture hangar agricole",
    "Pose toiture garage",
    "Rénovation toiture véranda",
    "Étanchéité balcon terrasse",
    "Création puits de lumière",
    "Pose de tuiles photovoltaïques",
    "Réparation après incendie",
    "Désamiantage toiture",
    "Couverture extension maison",
    "Réfection toiture copropriété",
    "Toiture de ma maison qui fuit depuis plusieurs mois",
    "Besoin de refaire entièrement le toit avant l'hiver",
    "Tuiles anciennes à remplacer par des neuves",
    "Problème d'infiltration au niveau de la cheminée",
    "Gouttières bouchées et débordantes",
    "Mousse et lichen sur toute la toiture",
    "Fenêtre de toit qui fuit quand il pleut",
    "Charpente à vérifier et traiter",
    "Isolation insuffisante dans les combles",
    "Toiture qui vieillit mal et se dégrade",
    "Ardoises cassées à remplacer rapidement",
    "Zinc des gouttières percé à plusieurs endroits",
    "Faîtage décollé suite au vent",
    "Sous-face de débord à refaire",
    "Tuiles ternies qui font sale",
    "Problème de condensation sous toiture",
    "Ventilation insuffisante des combles",
    "Raccord étanchéité à refaire",
    "Tuiles de rive cassées",
    "Cheneau en mauvais état",
    "Noue qui fuit régulièrement",
    "Solin de cheminée fissuré",
    "Lucarne qui laisse passer l'eau",
    "Toiture plate avec flaques d'eau",
    "Membrane qui se décolle aux joints",
    "Zinguerie complète à refaire",
    "Descentes pluviales cassées",
    "Grêle ayant abîmé les tuiles",
    "Tempête ayant arraché des tuiles",
    "Travaux urgents suite intempéries",
    "Devis pour rénovation complète",
    "Comparatif tuiles terre cuite ou béton",
    "Choix entre ardoise naturelle ou fibro",
    "Diagnostic état de la toiture",
    "Expertise avant achat immobilier",
    "Réfection pour vente maison",
    "Mise aux normes toiture ancienne",
    "Amélioration performance énergétique",
    "Réduction des ponts thermiques",
    "Pose d'isolant haute performance",
    "Création d'un espace habitable",
    "Aménagement de combles en chambre",
    "Transformation grenier en bureau",
    "Ajout de surface habitable",
    "Extension avec nouvelle toiture",
    "Raccordement ancien et nouveau toit",
    "Harmonisation des matériaux",
    "Respect des règles d'urbanisme",
    "Conformité réglementaire",
    "Travaux pour permis de construire",
    "Ma toiture a 30 ans et montre des signes de fatigue",
    "Infiltrations récurrentes malgré réparations",
    "Problème de ventilation créant de l'humidité",
    "Tuiles gelées qui se délitent",
    "Charpente attaquée par les insectes",
    "Besoin d'un nettoyage professionnel annuel",
    "Gouttières en PVC à remplacer par du zinc",
    "Fenêtre de toit trop ancienne à changer",
    "Isolation à refaire selon diagnostic",
    "Toiture non conforme aux normes",
    "Projet de rénovation globale énergétique",
    "Artisan recherché pour travaux en hauteur",
    "Couvreur zingueur pour travail soigné",
    "Entreprise RGE pour aides gouvernementales",
    "Devis détaillé pour assurance sinistre",
    "Expertise contradictoire toiture",
    "Litige avec précédent artisan",
    "Reprise travaux mal réalisés",
    "Malfaçons à corriger rapidement",
    "Garantie décennale à faire jouer",
    "Intervention sous garantie",
    "Extension garantie toiture",
    "Contrat d'entretien annuel",
    "Maintenance préventive toiture",
    "Vérification annuelle avant hiver",
    "Préparation toiture saison froide",
    "Protection gel et neige",
    "Installation câble chauffant",
    "Prévention formation verglas",
    "Sécurisation accès toiture",
    "Installation crochets de sécurité",
    "Mise en place ligne de vie",
    "Création accès technique",
    "Pose trappe de visite",
    "Échelle de toit fixe",
    "Sécurisation chantier toiture",
    "Protection échafaudage",
    "Bâchage provisoire toiture",
    "Mise hors d'eau urgente",
    "Protection intempéries temporaire",
    "Travaux en urgence week-end",
    "Dépannage toiture nuit",
    "Intervention rapide fuite",
    "Service toiture 7j/7",
    "Couvreur disponible immédiatement",
    "Réparation sous 48 heures",
    "Devis gratuit sous 24 heures",
    "Visite technique offerte",
    "Diagnostic toiture gratuit",
    "Estimation travaux sans engagement",
    "Rénovation respect patrimoine",
    "Matériaux traditionnels bâtiment classé",
    "Tuiles de récupération authenticité",
    "Ardoises anciennes reconditionnées",
    "Savoir-faire artisanal couverture",
    "Techniques traditionnelles toiture",
    "Couverture à l'ancienne",
    "Restauration toiture monument",
    "Réfection toiture protégée ABF",
    "Travaux validés architecte",
    "Couverture bâtiment industriel",
    "Toiture entrepôt logistique",
    "Réfection toiture usine",
    "Couverture bâtiment commercial",
    "Toiture centre commercial",
    "Rénovation toiture bureaux",
    "Imperméabilisation parking couvert",
    "Étanchéité toiture végétalisée",
    "Création terrasse accessible",
    "Toiture terrasse jardinet",
    "Installation bac potager toiture",
    "Aménagement rooftop",
    "Création espace détente toit",
    "Pose dalles sur plots",
    "Revêtement terrasse accessible",
    "Étanchéité sous carrelage",
    "Membrane sous protection lourde",
    "Drain et géotextile terrasse",
    "Évacuation eaux pluviales",
    "Descente EP surdimensionnée",
    "Trop plein sécurité terrasse",
    "Garde corps toiture terrasse",
    "Acrotère et couvertine",
    "Relevé étanchéité périphérique",
    "Joint de dilatation toiture",
    "Traitement fissure dalle béton",
    "Réparation béton toiture",
    "Ragréage surface toiture plate",
    "Pente écoulement à créer",
    "Forme de pente isolante",
    "Panneau isolant toiture terrasse",
    "Pare vapeur sous isolation",
    "Continuité isolation façade toit",
    "Suppression ponts thermiques",
    "Rénovation globale enveloppe",
    "Performance BBC rénovation",
    "Label RGE reconnu garant",
    "Qualification Qualibat couverture",
];

async function seed() {
    console.log("🏠 Seeding Roofing Contractor data...\n");

    const user = await prisma.user.findFirst({ where: { email: USER_EMAIL } });
    if (!user) {
        console.error(`❌ User ${USER_EMAIL} not found!`);
        return;
    }
    console.log(`✓ Found user: ${user.email}\n`);

    const CATEGORY = "ROOFING_CONTRACTOR";

    // CLEANUP
    console.log(`🧹 Clearing existing ${CATEGORY} data...`);
    await prisma.reviewTemplate.deleteMany({ where: { category: CATEGORY } });
    await prisma.reviewContext.deleteMany({ where: { category: CATEGORY } });
    console.log(`✓ Cleared old data`);

    // Insert 1-line templates
    console.log("📝 Creating 1-line templates...");
    for (let i = 0; i < TEMPLATES_1LINE.length; i++) {
        await prisma.reviewTemplate.create({
            data: {
                userId: user.id,
                name: `Roofing 1L-${i + 1}`,
                lines: 1,
                category: "ROOFING_CONTRACTOR",
                promptInstruction: TEMPLATES_1LINE[i],
                namePosition: TEMPLATES_1LINE[i].includes("{business_name}") ? "middle" : "none",
                isActive: true,
            }
        });
    }
    console.log(`   ✓ ${TEMPLATES_1LINE.length} x 1-line templates`);

    // Insert 2-line templates
    console.log("📝 Creating 2-line templates...");
    for (let i = 0; i < TEMPLATES_2LINE.length; i++) {
        await prisma.reviewTemplate.create({
            data: {
                userId: user.id,
                name: `Roofing 2L-${i + 1}`,
                lines: 2,
                category: "ROOFING_CONTRACTOR",
                promptInstruction: TEMPLATES_2LINE[i],
                namePosition: TEMPLATES_2LINE[i].includes("{business_name}") ? "middle" : "none",
                isActive: true,
            }
        });
    }
    console.log(`   ✓ ${TEMPLATES_2LINE.length} x 2-line templates`);

    // Insert 3-line templates
    console.log("📝 Creating 3-line templates...");
    for (let i = 0; i < TEMPLATES_3LINE.length; i++) {
        await prisma.reviewTemplate.create({
            data: {
                userId: user.id,
                name: `Roofing 3L-${i + 1}`,
                lines: 3,
                category: "ROOFING_CONTRACTOR",
                promptInstruction: TEMPLATES_3LINE[i],
                namePosition: TEMPLATES_3LINE[i].includes("{business_name}") ? "middle" : "none",
                isActive: true,
            }
        });
    }
    console.log(`   ✓ ${TEMPLATES_3LINE.length} x 3-line templates`);

    // Insert contexts
    console.log("\n💬 Creating contexts...");
    for (let i = 0; i < CONTEXTS.length; i++) {
        await prisma.reviewContext.create({
            data: {
                userId: user.id,
                type: "scenario",
                title: `Roofing Context ${i + 1}`,
                content: CONTEXTS[i],
                category: "ROOFING_CONTRACTOR",
                isActive: true,
            }
        });
        if ((i + 1) % 50 === 0) console.log(`   ...${i + 1} contexts`);
    }
    console.log(`   ✓ ${CONTEXTS.length} contexts`);

    const total = TEMPLATES_1LINE.length + TEMPLATES_2LINE.length + TEMPLATES_3LINE.length;
    console.log(`\n✅ Complete! ${total} templates + ${CONTEXTS.length} contexts for ROOFING_CONTRACTOR`);
}

seed()
    .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
