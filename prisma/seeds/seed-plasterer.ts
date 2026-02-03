import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const USER_EMAIL = "demo@clientflow.local";

// Templates: 30 x 1-line, 40 x 2-line, 30 x 3-line = 100 total
// ~10% have {business_name}
const TEMPLATES_1LINE = [
    "Travail de plâtrerie impeccable, murs parfaitement lisses.",
    "Excellente pose de cloisons, je recommande vivement.",
    "Plaquiste très professionnel et chantier propre.",
    "Faux-plafond réalisé à la perfection, merci !",
    "Service rapide et résultat soigné pour mon isolation.",
    "Très bon artisan, bandes à joints invisibles.",
    "Je recommande {business_name} pour vos travaux de placo.",
    "Travail minutieux, finitions au top.",
    "Rénovation des murs réussie, bravo à l'équipe.",
    "Plâtrier compétent et respectueux des délais.",
    "Excellent rapport qualité-prix pour le doublage.",
    "Chantier laissé propre chaque soir, appréciable.",
    "Pose de plaques de plâtre rapide et efficace.",
    "Artisan sérieux, je ferai appel à eux à nouveau.",
    "Isolation phonique très bien réalisée.",
    "Merci pour ce travail de qualité sur mes plafonds.",
    "Équipe sympathique et travail de pro.",
    "Finitions peinture prêtes, ponçage nickel.",
    "Très satisfait de l'aménagement des combles.",
    "Cloisons sèches posées parfaitement d'aplomb.",
    "Devis respecté et travail conforme.",
    "Un savoir-faire évident, résultat magnifique.",
    "Intervention rapide pour des réparations, super.",
    "Je recommande les yeux fermés pour le plâtre.",
    "Enduit de lissage impeccable, murs comme neufs.",
    "Professionnalisme et conseils avisés.",
    "Travaux de plâtrerie traditionnelle superbes.",
    "Aménagement intérieur transformé grâce à vous.",
    "Respect du planning et gentillesse en plus.",
    "Le meilleur plaquiste de la région !",
];

const TEMPLATES_2LINE = [
    "J'ai fait appel à cette entreprise pour l'isolation de ma maison. Le travail est soigné et l'équipe a été très discrète pendant les travaux.",
    "Rénovation complète des murs de mon salon avec pose de placo. Le résultat est bluffant, les murs sont parfaitement droits et lisses.",
    "Création d'un faux-plafond avec spots intégrés. La réalisation est technique et esthétique, je suis ravi du rendu final.",
    "Merci à {business_name} pour la pose de cloisons dans mes bureaux. Espace optimisé et isolation acoustique performante.",
    "Un grand merci pour la réactivité suite à un dégât des eaux. Les réparations de plâtre sont invisibles, comme si rien ne s'était passé.",
    "Artisan passionné qui prend le temps d'expliquer son travail. Les finitions sont d'une rare qualité, je n'hésiterai pas à recommander.",
    "Pose de doublage thermique sur murs anciens en pierre. Le confort s'en ressent immédiatement, travail technique maîtrisé.",
    "Chantier d'aménagement de combles réalisé dans les temps. Les découpes sont précises même dans les angles difficiles.",
    "Équipe de plaquistes très professionnelle et organisée. Tout a été protégé avant le début du chantier, nettoyage parfait à la fin.",
    "Nous avons confié nos travaux de peinture et plâtrerie. La coordination était parfaite et le résultat est à la hauteur de nos attentes.",
    "Excellent travail sur les bandes à joints, aucun défaut visible. La mise en peinture a été un jeu d'enfant ensuite.",
    "Je suis très satisfait de la création de ma suite parentale. Les cloisons ont été montées rapidement et proprement.",
    "Entreprise sérieuse qui respecte ses engagements et ses devis. Pas de mauvaise surprise, c'est rassurant pour des travaux.",
    "Réalisation de moulures en plâtre pour donner du cachet. C'est magnifique, un vrai travail d'artiste plâtrier.",
    "Isolation phonique d'une chambre mitoyenne très efficace. Enfin du calme, merci pour vos conseils sur les matériaux.",
    "Travail sur une grande hauteur sous plafond maîtrisé. L'équipe est bien équipée et travaille en toute sécurité.",
    "Rattrapage de murs très abîmés dans une vieille maison. Le résultat est incroyable, tout est lisse et prêt à peindre.",
    "Pose de plaques hydrofuges dans ma salle de bain. Travail soigné autour des arrivées d'eau, étanchéité respectée.",
    "Contact agréable et devis reçu rapidement. L'intervention a été programmée vite et le travail est impeccable.",
    "Je recommande {business_name} pour leur expertise en plâtrerie sèches. Ils ont su trouver des solutions à mes problèmes d'agencement.",
    "Faux-plafond démontable posé dans mon commerce. Installation rapide sans gêner l'activité, très professionnel.",
    "Réalisation d'une niche décorative en placo pour ma TV. Design moderne et finitions soignées, exactement ce que je voulais.",
    "Traitement des joints de dilatation parfait. Pas de fissure malgré le travail du bâtiment, signe de qualité.",
    "Plâtrerie traditionnelle sur briquettes, à l'ancienne. Ravi de trouver encore des artisans qui maîtrisent ces techniques.",
    "Enduisage complet d'un appartement avant peinture. Les murs sont des miroirs, le peintre m'a dit que c'était du super boulot.",
    "Modification de cloisons pour agrandir le salon. L'ouverture a été faite proprement et les raccords sont invisibles.",
    "Isolation des rampants de toiture performante. On sent la différence de température, travail soigné et propre.",
    "Pose de cloisons coupe-feu dans notre local technique. Respect des normes de sécurité et dossier technique fourni.",
    "Création de placards intégrés en placo sur mesure. L'espace est optimisé au maximum, très bonne idée de l'artisan.",
    "Habillage de poutres apparentes pour moderniser la pièce. Le rendu est épuré et contemporain, très beau travail.",
    "Rénovation d'un plafond ancien en lattis plâtre. Sauvetage réussi, il est comme neuf sans avoir tout cassé.",
    "Pose de trappes de visite discrètes et fonctionnelles. Détail qui compte pour l'entretien futur, bien pensé.",
    "Chantier terminé avec deux jours d'avance sur le planning. Efficacité redoutable sans sacrifier la qualité.",
    "Conseils déco et aménagement pertinents en plus de la technique. Une vraie valeur ajoutée pour mon projet.",
    "Réparation d'un trou dans une cloison suite à un choc. On ne voit plus rien, la retouche est parfaite.",
    "Pose de corniches lumineuses pour éclairage indirect. Ambiance feutrée réussie, installation très propre.",
    "Doublage acoustique du mur mitoyen avec le voisin. Le silence est revenu, merci pour cette solution efficace.",
    "Travail soigné même dans les placards et les coins cachés. Le souci du détail est là, c'est très professionnel.",
    "Excellente préparation des supports avant carrelage. Le carreleur n'a eu aucun souci pour poser la faïence.",
    "Je ferai appel à vous pour mes prochains travaux sans hésiter. Une équipe de confiance et compétente.",
];

const TEMPLATES_3LINE = [
    "J'ai rénové entièrement mon appartement et confié toute la plâtrerie à cette entreprise. Du doublage des murs à la création de faux-plafonds, tout est parfait. Une équipe à l'écoute et un résultat haut de gamme.",
    "Besoin de diviser une grande pièce en deux chambres, le plaquiste a été de très bon conseil pour l'agencement. L'isolation phonique entre les deux pièces est excellente. Travail rapide, propre et dans le budget.",
    "Suite à l'achat d'une maison ancienne, il fallait tout réisoler et refaire les murs. {business_name} a fait un travail colossal avec une finition irréprochable. Ma maison est maintenant confortable et moderne.",
    "Création d'un plafond suspendu design avec décrochements et éclairages intégrés. La complexité technique n'a pas fait peur à l'équipe. Le résultat est spectaculaire, une vraie pièce maîtresse de ma déco.",
    "Intervention pour reprendre des malfaçons d'un précédent artisan sur mes bandes à joints. Ils ont réussi à tout rattraper, les murs sont enfin lisses. Un grand soulagement de voir de vrais professionnels à l'œuvre.",
    "Aménagement de combles perdus avec création de cloisons et isolation sous rampants. L'espace créé est magnifique et bien isolé. L'équipe a travaillé durement malgré la chaleur, bravo et merci.",
    "Pose de cloisons modulaires pour nos bureaux d'entreprise. Flexibilité et réactivité ont été les maîtres mots. L'installation s'est faite sans perturber notre travail, service B2B impeccable.",
    "Réalisation d'enduits décoratifs à la chaux dans mon salon. L'effet matière est superbe et donne beaucoup de cachet. Un savoir-faire artisanal qu'on ne trouve plus partout, je suis conquise.",
    "Gros chantier de rénovation thermique par l'intérieur. Doublage de tous les murs périphériques et plafonds. Le bilan thermique est excellent et les finitions sont prêtes à peindre. Parfait.",
    "J'avais des soucis d'humidité qui abîmaient mes bas de murs. Le plâtrier a traité le problème et posé des plaques hydrofuges adaptées. Solution pérenne et esthétique, je suis rassuré.",
    "Installation complexe de cloisons courbes pour un accueil de magasin. La maîtrise technique du cintrage de placo est impressionnante. Le rendu final est fluide et très élégant.",
    "Rénovation d'une cage d'escalier avec grande hauteur. Échafaudage monté en sécurité, travail soigné jusqu'au plafond. Pas une trace de poussière dans le reste de la maison, protection top.",
    "Pose de plaques fermacell pour une meilleure résistance aux chocs dans le couloir. Matériau plus dur bien travaillé, découpes nettes. L'artisan connaît bien ses produits et conseille bien.",
    "Création d'une bibliothèque sur mesure entièrement en placo. Les étagères sont solides et parfaitement intégrées au mur. Une réalisation unique qui change tout le salon.",
    "Isolation phonique renforcée pour mon studio de musique. Système boîte dans la boîte réalisé avec expertise. Le résultat acoustique est bluffant, je peux jouer sans déranger personne.",
    "Réfection des plafonds après installation d'une climatisation gainable. Les coffrages sont discrets et bien intégrés. On ne voit pas les gaines, le travail de camouflage est excellent.",
    "Je suis promoteur et je fais appel à {business_name} sur mes chantiers. Délais tenus, qualité constante, c'est un partenaire fiable. Jamais de réserves sur le lot plâtrerie à la livraison.",
    "Travail de précision pour l'intégration de portes à galandage. Les cloisons sont parfaitement alignées, les portes coulissent sans bruit. Mécanisme bien posé et habillage soigné.",
    "Rénovation écologique avec isolation chanvre et enduits terre. L'artisan est sensible aux bio-matériaux et maîtrise leur pose. Une démarche saine pour ma maison que j'ai appréciée.",
    "Reprise complète de la planéité des murs d'une vieille bâtisse avant peinture. Un travail de fourmi pour tout remettre d'tquerre. Le résultat est là, on dirait du neuf dans de l'ancien.",
    "Pose de plafonds acoustiques perforés dans notre salle de réunion. Le confort sonore a changé du tout au tout, plus d'écho. Solution technique préconisée et installée parfaitement.",
    "Démolition et évacuation de vieilles cloisons briques avant nouvelle distribution. Chantier très salissant géré avec propreté exemplaire. Tout a été débarrassé, un vrai service clé en main.",
    "Création de têtes de lit avec niches et liseuses intégrées en placo. Idée originale proposée par l'artisan et réalisée super bien. Ça donne un côté hôtel de luxe à nos chambres.",
    "Travaux réalisés pendant nos vacances, confiance totale. À notre retour, tout était fini, propre et conforme au devis. Quel plaisir de retrouver sa maison embellie sans les tracas.",
    "Habillage de cheminée contemporaine avec isolation spécifique feu. Sécurité et design alliés, le foyer est mis en valeur. Travail technique sur les matériaux incombustibles bien fait.",
    "Remplacement de tout le doublage polystyrène par de la laine de verre. Meilleure isolation et acoustique améliorée. Chantier rapide pour ne pas laisser la maison sans isolation.",
    "Pose de trappes invisibles sous carrelage mural. Ajustement millimétrique, c'est vraiment invisible une fois fermé. Détail de finition qui montre le niveau d'exigence.",
    "Réalisation d'arches en placo pour séparer salon et salle à manger. Les courbes sont régulières et douces. Ça apporte beaucoup de douceur à l'architecture intérieure.",
    "Isolation par l'intérieur d'un mur nord froid et humide. Problème résolu, plus de sensation de paroi froide. Le mur est sain et l'esthétique préservée, merci pour l'efficacité.",
    "Un grand bravo à toute l'équipe pour la rénovation de notre loft. Des volumes immenses à traiter, des hauteurs folles. Le résultat est à la hauteur du défi, c'est grandiose.",
];

// 200 contexts
const CONTEXTS = [
    "Pose de cloisons de distribution BA13",
    "Création de faux-plafond sur ossature",
    "Doublage des murs périphériques isolation",
    "Aménagement de combles perdus",
    "Pose de bandes à joints et ponçage",
    "Rénovation plafond ancien abîmé",
    "Isolation phonique mur mitoyen",
    "Création de placards en placo",
    "Pose de plaques hydrofuges salle de bain",
    "Enduisage complet murs (ratissage)",
    "Pose de portes à galandage",
    "Cloisonnement espace bureaux",
    "Habillage de poutres apparentes",
    "Création de niches décoratives",
    "Pose de plaques coupe-feu",
    "Isolation thermique par l'intérieur",
    "Réparation trou dans cloison",
    "Pose de corniches en plâtre",
    "Faux-plafond démontable dalles",
    "Habillage conduit de cheminée",
    "Cloison courbe ou cintrée",
    "Pose de Fermacell haute dureté",
    "Isolation acoustique plafond",
    "Création tête de lit placo",
    "Rattrapage planéité murs anciens",
    "Pose de trappes de visite",
    "Coffrage tuyauterie et gaines",
    "Aménagement suite parentale",
    "Division de pièces",
    "Rénovation après dégât des eaux",
    "Pose isolation laine de verre",
    "Plafond suspendu design",
    "Intégration spots dans plafond",
    "Enduit décoratif à la chaux",
    "Pose de cloisons alvéolaires",
    "Doublage collé map",
    "Isolation rampants toiture",
    "Réalisation de moulures staff",
    "Réfection cage d'escalier",
    "Cloisonnement local commercial",
    "Pose de plaques phoniques bleues",
    "Habillage bâti-support WC suspendu",
    "Création bibliothèque murale",
    "Pose d'ossature métallique",
    "Joints de dilatation bâtiment",
    "Plafond cathédrale",
    "Isolation mur nord froid",
    "Pose de verrière dans cloison",
    "Création arche de passage",
    "Réparation fissure plafond",
    "Rénovation complète appartement",
    "Maçonnerie intérieure briques plâtrières",
    "Projection plâtre machine",
    "Finition prêt à peindre",
    "Pose de laine de roche",
    "Cloison grande hauteur",
    "Habillage fenêtre de toit",
    "Création meuble TV intégré",
    "Isolation garage attenant",
    "Pose de suspentes et fourrures",
    "Besoin d'isoler une chambre du bruit de la rue",
    "Murs très irréguliers à lisser complètement",
    "Souhait de créer une cuisine ouverte",
    "Plafond qui s'effrite et tombe par endroits",
    "Humidité sur les murs nécessitant doublage",
    "Aménager le grenier en chambre d'ami",
    "Besoin de plus de rangements intégrés",
    "Cacher les tuyaux disgracieux dans l'entrée",
    "Rendre le salon plus lumineux avec plafond blanc",
    "Diviser une grande chambre en deux pour enfants",
    "Isoler le mur mitoyen avec voisins bruyants",
    "Refaire la salle de bain avec matériaux hydro",
    "Moderniser un intérieur rustique",
    "Créer un espace bureau dans le salon",
    "Réparer le plafond suite fuite d'eau",
    "Mettre aux normes incendie le local",
    "Améliorer le confort thermique de la maison",
    "Boucher une ancienne porte inutile",
    "Créer une déco moderne avec faux-plafond",
    "Intégrer une porte coulissante gain de place",
    "Rénover une maison des années 70",
    "Préparer les murs pour une peinture laquée",
    "Isoler phoniquement un cabinet médical",
    "Créer des zones dans un open space",
    "Habiller un mur télé cinéma",
    "Récupérer de la hauteur sous combles",
    "Cacher une poutre en béton armé",
    "Lisser un crépi intérieur démodé",
    "Créer une ambiance indirecte lumineuse",
    "Rénover un plafond en lambris bois",
    "Isoler un sous-sol pour en faire une salle de jeu",
    "Poser une cloison vitrée type atelier",
    "Renforcer un mur pour accrocher du lourd",
    "Créer un dressing derrière une tête de lit",
    "Rattraper un faux-niveau au plafond",
    "Isoler thermiquement une véranda",
    "Faire un coffre pour volet roulant",
    "Habiller un poteau porteur au milieu",
    "Créer des étagères invisibles",
    "Réduire la hauteur d'une pièce trop haute",
    "Isoler une extension ossature bois",
    "Faire une cloison amovible",
    "Rénover une cuisine avant pose meubles",
    "Créer un sas d'entrée",
    "Doubler un mur en parpaing brut",
    "Poser du placo sur ossature bois",
    "Faire un plafond rampant",
    "Créer une niche pour frigo américain",
    "Rénover un couloir sombre",
    "Isoler un plafond de garage sous chambre",
    "Murs avec fissures récurrentes à traiter",
    "Besoin de cloisons robustes pour école",
    "Rénovation express avant emménagement",
    "Chantier en site occupé (bureaux)",
    "Travaux de nuit pour commerce",
    "Respect normes accessibilité PMR",
    "Plâtrerie pour maison bioclimatique",
    "Utilisation matériaux écologiques",
    "Chantier avec accès difficile (étage)",
    "Coordination avec électricien plombier",
    "Devis détaillé pour assurance",
    "Respect du budget serré",
    "Délais impératifs à tenir",
    "Finition niveau Q4 demandée",
    "Protection sols existants exigée",
    "Évacuation gravats comprise",
    "Nettoyage fin de chantier inclus",
    "Garantie décennale obligatoire",
    "Certification RGE pour aides",
    "Conseil en agencement intérieur",
    "Étude acoustique préalable",
    "Plan de calepinage des plaques",
    "Choix peinture ou papier peint futur",
    "Support pour carrelage grand format",
    "Renfort pour cuisine suspendue",
    "Intégration système domotique",
    "Pose trappe accès VMC",
    "Habillage hotte cuisine",
    "Création imposte vitrée",
    "Cloison demie-hauteur bar",
    "Doublage thermo-acoustique complexe",
    "Traitement ponts thermiques",
    "Pose pare-vapeur continu",
    "Test étanchéité à l'air (infiltrométrie)",
    "Placo impact résistant école",
    "Plaque activ'air purifiant",
    "Isolation laine de bois",
    "Isolation ouate de cellulose",
    "Enduit plâtre gros",
    "Staff et ornementation",
    "Rosace plafond",
    "Corniche éclairante",
    "Colonne en staff",
    "Pilastre décoratif",
    "Coupole plafond",
    "Moulure murale cadre",
    "Plinthe en staff",
    "Plaque de plâtre cintrée sur site",
    "Ouvrage coupe-feu 1h",
    "Ouvrage coupe-feu 2h",
    "Gaine technique logement",
    "Coffre VMC collectif",
    "Plafond coupe-feu",
    "Cloison grande hauteur cinéma",
    "Correction acoustique salle spectacle",
    "Panneaux absorbants muraux",
    "Baffles acoustiques plafond",
    "Îlots acoustiques suspendus",
    "Traitement réverbération hall",
    "Cloison blindée (plomb) radiologie",
    "Placo pour pièce humide (H1)",
    "Placo très haute dureté (I)",
    "Plaque ciment (Aquapanel)",
    "Cloison anti-effraction",
    "Cloison pare-balles banque",
    "Doublage prégymax",
    "Complexe isolant calibel",
    "Plaque prégyplac",
    "Enduit joint Pégase",
    "Enduit lissage Promix",
    "Bande armée angle sortant",
    "Bande papier micro-perforée",
    "Vis TTPC 25mm",
    "Vis TTPC 35mm",
    "Montant M48",
    "Rail R48",
    "Fourrure F530",
    "Suspente integra",
    "Laine verre GR32",
    "Laine verre IBR",
    "Panneau polystyrène extrudé",
    "Polyuréthane projeté",
    "Plancher technique surélevé",
    "Chape sèche Fermacell",
    "Granules d'égalisation",
    "Plaque de sol Rigidur",
    "Réparation dégât plâtre ancien",
    "Staffeur ornemaniste restauration",
    "Gypserie traditionnelle",
    "Stuc marbre",
    "Staff pierre",
    "Enduit terre crue",
    "Enduit chaux chanvre banché",
    "Isolation paille technique",
    "Brique de terre crue",
    "Cloison japonisante",
    "Cloison amovible bureau",
    "Cloison accordéon",
    "Porte affleurante invisible",
    "Plinthe affleurante",
    "Gorge lumineuse plafond",
    "Fente lumineuse murale",
    "Profilé led intégré placo",
    "Nez de cloison arrondi",
    "Angle mur arrondi",
    "Finition joint creux plafond",
    "Finition joint creux plafond",
    "Finition joint creux plinthe",
];

// Slice to ensure exactly 200 if the list is longer
const FINAL_CONTEXTS = CONTEXTS.slice(0, 200);

async function seed() {
    console.log("🛠️ Seeding Plasterer (Plâtrier/Plaquiste) data...\n");

    const user = await prisma.user.findFirst({ where: { email: USER_EMAIL } });
    if (!user) {
        console.error(`❌ User ${USER_EMAIL} not found!`);
        return;
    }
    console.log(`✓ Found user: ${user.email}\n`);

    // Ensure category exists (optional, mostly system handled but good practice)
    // Assuming "PLASTERER" is the target slug. 
    // If not exists, templates often just link by string in this schema?
    // Looking at schema: ReviewTemplate has `category` string field.
    // So we just use "PLASTERER" string.

    const CATEGORY = "PLASTERER";

    // CLEANUP: Remove existing data for this category to avoid duplicates
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
                name: `Plasterer 1L-${i + 1}`,
                lines: 1,
                category: CATEGORY,
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
                name: `Plasterer 2L-${i + 1}`,
                lines: 2,
                category: CATEGORY,
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
                name: `Plasterer 3L-${i + 1}`,
                lines: 3,
                category: CATEGORY,
                promptInstruction: TEMPLATES_3LINE[i],
                namePosition: TEMPLATES_3LINE[i].includes("{business_name}") ? "middle" : "none",
                isActive: true,
            }
        });
    }
    console.log(`   ✓ ${TEMPLATES_3LINE.length} x 3-line templates`);

    // Insert contexts
    console.log("\n💬 Creating contexts...");
    for (let i = 0; i < FINAL_CONTEXTS.length; i++) {
        await prisma.reviewContext.create({
            data: {
                userId: user.id,
                type: "scenario",
                title: `Plasterer Context ${i + 1}`,
                content: FINAL_CONTEXTS[i],
                category: CATEGORY,
                isActive: true,
            }
        });
        if ((i + 1) % 50 === 0) console.log(`   ...${i + 1} contexts`);
    }
    console.log(`   ✓ ${FINAL_CONTEXTS.length} contexts`);

    const total = TEMPLATES_1LINE.length + TEMPLATES_2LINE.length + TEMPLATES_3LINE.length;
    console.log(`\n✅ Complete! ${total} templates + ${FINAL_CONTEXTS.length} contexts for ${CATEGORY}`);
}

seed()
    .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
    .finally(async () => { await prisma.$disconnect(); });
