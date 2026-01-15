import collegeData from '../data/collegeKnowledgeBase.json';
import qaData from '../data/qaDatabase.json';
import type { SearchResult, Language, FAQ } from '../types';
import { findLocation, isLocationQuery, type CampusLocation } from '../data/locations';

// Type the imported data
const knowledgeBase = collegeData as typeof collegeData;

// Q&A Database type
interface QAEntry {
    id: number;
    question_patterns: string[];
    tags: string[];
    answer_facts: Record<string, unknown>;
}
const qaDatabase = qaData as unknown as QAEntry[];

// Category keywords for intelligent matching
const categoryKeywords: Record<string, string[]> = {
    admission: ['admission', 'apply', 'keam', 'entrance', 'join', 'eligibility', 'admit', 'enroll', 'register'],
    fees: ['fee', 'fees', 'cost', 'tuition', 'payment', 'scholarship', 'amount', 'pay', 'charge', 'price'],
    courses: ['course', 'branch', 'program', 'btech', 'mtech', 'mca', 'cse', 'ece', 'eee', 'mechanical', 'civil', 'it', 'degree'],
    placements: ['placement', 'job', 'company', 'salary', 'package', 'recruit', 'career', 'hire', 'employ'],
    boys_hostel: ['boys hostel', 'men hostel', 'mens hostel', "men's hostel", 'gents hostel', 'boys'],
    ladies_hostel: ['ladies hostel', 'girls hostel', 'womens hostel', "women's hostel", 'shahanas', 'girls'],
    hostel: ['hostel', 'accommodation', 'stay', 'room', 'mess', 'dormitory', 'boarding'],
    facilities: ['library', 'lab', 'sports', 'wifi', 'canteen', 'facility', 'amenity', 'infrastructure'],
    contact: ['contact', 'phone', 'email', 'call', 'reach', 'office', 'number'],
    location: ['location', 'where', 'direction', 'navigate', 'map', 'place', 'address'],
    principal: ['principal', 'head', 'director', 'admin', 'administration'],
    events: ['event', 'fest', 'festival', 'asthra', 'dhwani', 'cultural', 'technical'],
};

// Random element picker
function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

// Get time-based greeting
function getTimeBasedGreeting(): string {
    const hour = new Date().getHours();
    const greetings = knowledgeBase.humanResponses.greetings;

    if (hour >= 5 && hour < 12) {
        return getRandomElement(greetings.morning);
    } else if (hour >= 12 && hour < 17) {
        return getRandomElement(greetings.afternoon);
    } else if (hour >= 17 && hour < 21) {
        return getRandomElement(greetings.evening);
    }
    return getRandomElement(greetings.general);
}

// Make response human-like with natural conversational flow
function humanizeResponse(response: string, isFirstMessage: boolean = false): string {
    // Natural conversation starters - varied and friendly
    const conversationalStarters = [
        "Oh, that's a great question! ",
        "Sure thing! ",
        "Actually, ",
        "Well, ",
        "So basically, ",
        "Great question! ",
        "Yeah, let me tell you about that. ",
        "Absolutely! ",
        "Here's the thing - ",
        "Good one! ",
    ];

    // More optional mid-sentence transitions for flow
    const transitionPhrases = [
        "",  // Often no transition needed
        "",
        "And you know what? ",
        "Oh, and ",
        "By the way, ",
        "Also, ",
    ];

    const closing = getRandomElement(knowledgeBase.humanResponses.closing);
    let result = response;

    // Add greeting for first message
    if (isFirstMessage && Math.random() > 0.3) {
        result = `${getTimeBasedGreeting()}\n\n${result}`;
    } else if (Math.random() > 0.4) {
        // Add a conversational starter to make it feel more natural
        const starter = getRandomElement(conversationalStarters);
        result = `${starter}${result.charAt(0).toLowerCase()}${result.slice(1)}`;
    }

    // Optionally add transition in middle for longer responses (if has multiple sentences)
    const sentences = result.split(/(?<=[.!?])\s+/);
    if (sentences.length > 2 && Math.random() > 0.7) {
        const transition = getRandomElement(transitionPhrases);
        if (transition) {
            const insertPoint = Math.floor(sentences.length / 2);
            sentences[insertPoint] = transition + sentences[insertPoint];
            result = sentences.join(' ');
        }
    }

    // Add closing follow-up question sometimes (feels more helpful)
    if (Math.random() > 0.5) {
        result = `${result}\n\n${closing}`;
    }

    return result;
}

// Search FAQs
function searchFAQs(query: string, language: Language): SearchResult | null {
    const queryLower = query.toLowerCase();
    const faqs = knowledgeBase.faqs as FAQ[];

    for (const faq of faqs) {
        // Check question match
        const questionMatch = faq.question.toLowerCase().includes(queryLower) ||
            queryLower.includes(faq.question.toLowerCase().split(' ').slice(0, 3).join(' '));

        // Check keyword match
        const keywordMatch = faq.keywords.some(k => queryLower.includes(k.toLowerCase()));

        if (questionMatch || keywordMatch) {
            const answer = (language === 'ml' && faq.answerMalayalam) ? faq.answerMalayalam : faq.answer;
            return {
                content: answer,
                category: faq.category,
                confidence: questionMatch ? 0.9 : 0.7,
                source: 'faq'
            };
        }
    }

    return null;
}

// Get category response - conversational and human-like with language support
function getCategoryResponse(category: string, language: Language): string {
    // Responses in all three languages
    const responses: Record<string, Record<Language, string>> = {
        admission: {
            en: `Yes, you can definitely join our college! The admission is through KEAM - that's the Kerala Engineering Entrance Exam.

Basically, you write KEAM in April-May, get your rank, and then attend the counselling in July-August. Based on your rank, you get allotted to a college and branch.

The eligibility is Plus Two with Physics, Chemistry, and Maths - you need at least 50% marks.

Are you planning to apply this year? I can tell you more about the specific process or documents needed!`,

            ml: `അതെ, നിങ്ങൾക്ക് തീർച്ചയായും ഞങ്ങളുടെ കോളേജിൽ ചേരാം! പ്രവേശനം KEAM വഴിയാണ് - അത് കേരള എഞ്ചിനീയറിംഗ് പ്രവേശന പരീക്ഷയാണ്.

ഏപ്രിൽ-മെയ് മാസത്തിൽ KEAM എഴുതുക, റാങ്ക് നേടുക, ജൂലൈ-ഓഗസ്റ്റിൽ കൗൺസിലിംഗിൽ പങ്കെടുക്കുക. നിങ്ങളുടെ റാങ്ക് അനുസരിച്ച് കോളേജും ബ്രാഞ്ചും ലഭിക്കും.

യോഗ്യത പ്ലസ് ടു ആണ് - ഫിസിക്സ്, കെമിസ്ട്രി, മാത്തമാറ്റിക്സ് എന്നിവ 50% മാർക്കോടെ.

ഈ വർഷം അപേക്ഷിക്കാൻ പ്ലാൻ ചെയ്യുന്നുണ്ടോ? കൂടുതൽ വിവരങ്ങൾ പറയാം!`,

            manglish: `Athe, ningalkku theerchayayum namude collegil cheranam! Admission KEAM vazhiyanu - athu Kerala Engineering Entrance Exam aanu.

April-May il KEAM ezhuthuka, rank neduka, July-August il counselling il pankedukkuka. Ningalude rank anusarich college um branch um labhikkum.

Eligibility Plus Two aanu - Physics, Chemistry, Maths okke 50% marks venam.

Ee varsham apply cheyan plan cheyyunnundo? Koode process ne patti parayam!`
        },

        fees: {
            en: `The fees depend on which quota you get admission through:

Government quota is around 40 thousand per year - this is for students who get good ranks in KEAM.

Management quota is about 70 thousand per year.

NRI quota is around 1 lakh 5 thousand per year.

Hostel is extra - roughly 35 thousand per year including food.

Which quota are you looking at? I can also tell you about scholarships if you're interested!`,

            ml: `ഫീസ് ഏത് ക്വാട്ട വഴി അഡ്മിഷൻ കിട്ടുന്നു എന്നതിനെ ആശ്രയിച്ചിരിക്കുന്നു:

ഗവൺമെന്റ് ക്വാട്ട - ഏകദേശം 40,000 രൂപ പ്രതിവർഷം. KEAM ൽ നല്ല റാങ്ക് കിട്ടുന്നവർക്ക്.

മാനേജ്മെന്റ് ക്വാട്ട - ഏകദേശം 70,000 രൂപ പ്രതിവർഷം.

NRI ക്വാട്ട - ഏകദേശം 1 ലക്ഷം 5000 രൂപ പ്രതിവർഷം.

ഹോസ്റ്റൽ ഫീസ് - ഏകദേശം 35,000 രൂപ, ഭക്ഷണം ഉൾപ്പെടെ.

ഏത് ക്വാട്ടയാണ് നിങ്ങൾ നോക്കുന്നത്? സ്കോളർഷിപ്പുകളെ കുറിച്ചും പറയാം!`,

            manglish: `Fees ethu quota vazhiyanu admission kittunnathu ennathiney depend cheyyunnu:

Government quota - 40,000 rupees per year aanu. KEAM il nalla rank kittunnavar kku.

Management quota - 70,000 rupees per year.

NRI quota - 1 lakh 5000 rupees per year.

Hostel extra aanu - roughly 35,000 rupees per year food um koode.

Ethu quota aanu ningal nokkunnath? Scholarships ne kurichu koode parayam!`
        },

        courses: {
            en: `We have 6 B.Tech branches here:

Computer Science has the most seats - 120. Then we have ECE, EEE, Mechanical, Civil, and IT - each with 60 seats.

For postgraduation, we offer M.Tech in Computer Science and Power Electronics. We also have MCA.

Which branch are you interested in? I can tell you more about any specific program!`,

            ml: `ഞങ്ങൾക്ക് 6 B.Tech ബ്രാഞ്ചുകൾ ഉണ്ട്:

കമ്പ്യൂട്ടർ സയൻസിൽ ഏറ്റവും കൂടുതൽ സീറ്റുകൾ - 120. ECE, EEE, മെക്കാനിക്കൽ, സിവിൽ, IT - ഓരോന്നിലും 60 സീറ്റ് വീതം.

PG ക്ക് M.Tech ഉണ്ട് - കമ്പ്യൂട്ടർ സയൻസിലും പവർ ഇലക്ട്രോണിക്സിലും. MCA യും ഉണ്ട്.

ഏത് ബ്രാഞ്ചിലാണ് താൽപര്യം? കൂടുതൽ വിവരങ്ങൾ പറയാം!`,

            manglish: `Namukku 6 B.Tech branches undu:

Computer Science il etravum koode seats undu - 120. Pinne ECE, EEE, Mechanical, Civil, IT - ellathilum 60 seats veetham.

PG nu M.Tech undu - Computer Science ilum Power Electronics ilum. MCA yum undu.

Ethu branch ilanu interest? Koode details parayam!`
        },

        placements: {
            en: `Our placements are quite good actually! Around 70 to 80 percent of students get placed every year.

The average package is around 4 to 5 lakhs per annum. The highest has gone up to 12 lakhs.

Companies like TCS, Infosys, Wipro, UST Global, and many others come to recruit from our campus.

Would you like to know about placement training or which companies visit for your specific branch?`,

            ml: `ഞങ്ങളുടെ പ്ലേസ്മെന്റ് വളരെ നല്ലതാണ്! ഓരോ വർഷവും 70 മുതൽ 80 ശതമാനം വിദ്യാർത്ഥികൾ പ്ലേസ് ആകുന്നു.

ശരാശരി പാക്കേജ് 4 മുതൽ 5 ലക്ഷം രൂപ വരെ. ഏറ്റവും ഉയർന്നത് 12 ലക്ഷം വരെ പോയിട്ടുണ്ട്.

TCS, Infosys, Wipro, UST Global തുടങ്ങിയ കമ്പനികൾ ക്യാമ്പസിലേക്ക് റിക്രൂട്ട് ചെയ്യാൻ വരുന്നു.

പ്ലേസ്മെന്റ് ട്രെയിനിംഗിനെ കുറിച്ച് അറിയണോ?`,

            manglish: `Namude placements valare nallathanu! Every year 70 to 80 percent students place akunnu.

Average package 4 to 5 lakhs per annum aanu. Highest 12 lakhs vare poyittundu.

TCS, Infosys, Wipro, UST Global okke campus il recruit cheyan varunnu.

Placement training ne kurichu ariyano?`
        },

        boys_hostel: {
            en: `The boys hostel can accommodate around 300 students. Each room is shared by 2 to 3 students.

The facilities include attached mess with good food, WiFi connectivity, common room with TV, indoor games, and 24/7 water supply. There's also generator backup for power cuts.

The hostel fee is around 35 thousand per year, which includes food. That's pretty reasonable, right?

Do you want to know about the rules, or maybe the mess timings?`,

            ml: `ബോയ്സ് ഹോസ്റ്റലിൽ ഏകദേശം 300 വിദ്യാർത്ഥികൾക്ക് താമസിക്കാം. ഓരോ റൂമിലും 2 മുതൽ 3 പേർ വരെ.

സൗകര്യങ്ങൾ - മെസ്സ്, WiFi, കോമൺ റൂം, TV, ഇൻഡോർ ഗെയിംസ്, 24 മണിക്കൂറും വെള്ളം. ജനറേറ്റർ ബാക്കപ്പും ഉണ്ട്.

ഫീസ് ഏകദേശം 35,000 രൂപ പ്രതിവർഷം, ഭക്ഷണം ഉൾപ്പെടെ.

റൂൾസ് അല്ലെങ്കിൽ മെസ്സ് ടൈമിംഗ് അറിയണോ?`,

            manglish: `Boys hostel il 300 students nu thamasikkam. Each room il 2 to 3 per share cheyyum.

Facilities - mess with good food, WiFi, common room, TV, indoor games, 24/7 water supply. Generator backup um undu.

Fee 35,000 rupees per year aanu, food um koode ulppede.

Rules allenkil mess timing ariyano?`
        },

        ladies_hostel: {
            en: `The ladies hostel is called Shahanas and it has capacity for about 200 students. Rooms are shared by 2 to 3 students.

Security is really good here - there's 24/7 security with CCTV surveillance and a lady warden stays on the premises. We take safety very seriously.

Facilities include mess, WiFi, common room, indoor games, and generator backup. The fee is around 35 thousand per year including food.

Would you like to know more about the mess food or the hostel rules?`,

            ml: `ലേഡീസ് ഹോസ്റ്റലിന്റെ പേര് ഷഹാനാസ് എന്നാണ്. ഏകദേശം 200 വിദ്യാർത്ഥിനികൾക്ക് താമസിക്കാം. ഓരോ റൂമിലും 2 മുതൽ 3 പേർ വരെ.

സെക്യൂരിറ്റി വളരെ നല്ലതാണ് - 24 മണിക്കൂറും CCTV സർവൈലൻസും ലേഡി വാർഡനും ഉണ്ട്.

മെസ്സ്, WiFi, കോമൺ റൂം, ഇൻഡോർ ഗെയിംസ്, ജനറേറ്റർ ബാക്കപ്പ് എന്നിവ ഉണ്ട്. ഫീസ് 35,000 രൂപ, ഭക്ഷണം ഉൾപ്പെടെ.

മെസ്സ് ഫുഡ് അല്ലെങ്കിൽ റൂൾസ് അറിയണോ?`,

            manglish: `Ladies hostel inte peru Shahanas ennu aanu. 200 students nu thamasikkam. Each room il 2 to 3 per.

Security valare nallathanu - 24/7 CCTV surveillance um lady warden um undu. Safety serious aayi edukkunnu.

Mess, WiFi, common room, indoor games, generator backup okke undu. Fee 35,000 rupees per year, food koode.

Mess food allenkil rules ariyano?`
        },

        hostel: {
            en: `Yes, we do have hostel facility! We have separate hostels for boys and girls.

Which one would you like to know more about - the boys hostel or the ladies hostel?`,

            ml: `അതെ, ഞങ്ങൾക്ക് ഹോസ്റ്റൽ സൗകര്യം ഉണ്ട്! ആൺകുട്ടികൾക്കും പെൺകുട്ടികൾക്കും വെവ്വേറെ ഹോസ്റ്റലുകൾ.

ഏതിനെ കുറിച്ചാണ് അറിയേണ്ടത് - ബോയ്സ് ഹോസ്റ്റൽ അതോ ലേഡീസ് ഹോസ്റ്റൽ?`,

            manglish: `Athe, namukku hostel facility undu! Boys num girls num separate hostels aanu.

Ethine kurichu ariyendath - boys hostel atho ladies hostel?`
        },

        contact: {
            en: `You can reach our college office during working hours - Monday to Saturday, 10 AM to 5 PM.

The best way is to call the main office or send an email to lbscek@gmail.com.

What do you need help with specifically? Admissions, placements, or something else? I can give you the right contact!`,

            ml: `കോളേജ് ഓഫീസിലേക്ക് വിളിക്കാം - തിങ്കൾ മുതൽ ശനി വരെ, രാവിലെ 10 മുതൽ വൈകിട്ട് 5 വരെ.

മെയിൻ ഓഫീസിലേക്ക് വിളിക്കുകയോ lbscek@gmail.com ലേക്ക് ഇമെയിൽ അയക്കുകയോ ചെയ്യാം.

എന്തിനെ കുറിച്ചാണ് അറിയേണ്ടത്? അഡ്മിഷൻ, പ്ലേസ്മെന്റ്, അല്ലെങ്കിൽ മറ്റെന്തെങ്കിലും?`,

            manglish: `College office ilekku vilikkanam - Monday to Saturday, 10 AM to 5 PM.

Main office ilekku call cheyyukayo lbscek@gmail.com ilekku email ayakkukayo cheyyam.

Enthiney kurichu ariyendath? Admission, placement, allenkil mattenthenkilum?`
        },

        location: {
            en: `We're located at Povval, which is about 8 kilometers from Kasaragod town center.

The area is well connected by road. You can easily find us on Google Maps - just search for LBS College of Engineering Kasaragod.

Are you planning to visit the campus? I can help you with directions from wherever you're coming from!`,

            ml: `ഞങ്ങൾ പോവ്വലിലാണ് - കാസർഗോഡ് ടൗണിൽ നിന്ന് ഏകദേശം 8 കിലോമീറ്റർ.

റോഡ് കണക്ഷൻ നല്ലതാണ്. Google Maps ൽ LBS College of Engineering Kasaragod എന്ന് സെർച്ച് ചെയ്താൽ മതി.

ക്യാമ്പസ് സന്ദർശിക്കാൻ പ്ലാൻ ഉണ്ടോ? ഡയറക്ഷൻ പറഞ്ഞു തരാം!`,

            manglish: `Nammal Povval il aanu - Kasaragod town il ninnum 8 kilometer.

Road connection nallathanu. Google Maps il LBS College of Engineering Kasaragod ennu search cheythal mathi.

Campus visit cheyan plan undo? Direction paranju tharam!`
        },

        facilities: {
            en: `We have pretty good facilities here!

The main ones are our Central Library with over 25 thousand books, a Computer Center with more than 200 systems, and a Fab Lab with 3D printers and CNC machines.

We also have good sports facilities including football ground, basketball court, and indoor games.

What facility would you like to know more about? Library, labs, sports, or canteen?`,

            ml: `ഞങ്ങൾക്ക് നല്ല സൗകര്യങ്ങൾ ഉണ്ട്!

സെൻട്രൽ ലൈബ്രറിയിൽ 25,000 ലധികം പുസ്തകങ്ങൾ, കമ്പ്യൂട്ടർ സെന്ററിൽ 200 ലധികം സിസ്റ്റങ്ങൾ, Fab Lab ൽ 3D പ്രിന്ററും CNC മെഷീനും.

സ്പോർട്സ് - ഫുട്ബോൾ ഗ്രൗണ്ട്, ബാസ്കറ്റ്ബോൾ കോർട്ട്, ഇൻഡോർ ഗെയിംസ്.

ഏത് ഫെസിലിറ്റിയെ കുറിച്ചാണ് അറിയേണ്ടത്? ലൈബ്രറി, ലാബ്സ്, സ്പോർട്സ്, കാന്റീൻ?`,

            manglish: `Namukku nalla facilities undu!

Central Library il 25,000 il adhikam books, Computer Center il 200 il adhikam systems, Fab Lab il 3D printers um CNC machines um.

Sports - football ground, basketball court, indoor games.

Ethu facility ne kurichu ariyendath? Library, labs, sports, canteen?`
        },

        principal: {
            en: `Our Principal is Dr. Mohammad Shekoor T. He has a PhD and his office is in the Administrative Block on the first floor.

If you need to meet him, the office hours are 10 AM to 5 PM, Monday to Saturday.

Is there something specific you need to discuss with the principal? I might be able to help or direct you to the right person!`,

            ml: `ഞങ്ങളുടെ പ്രിൻസിപ്പൽ ഡോ. മുഹമ്മദ് ഷെക്കൂർ ടി. അദ്ദേഹത്തിന് PhD ഉണ്ട്. ഓഫീസ് അഡ്മിനിസ്ട്രേറ്റീവ് ബ്ലോക്കിൽ ഒന്നാം നിലയിൽ.

കാണണമെങ്കിൽ, ഓഫീസ് സമയം രാവിലെ 10 മുതൽ വൈകിട്ട് 5 വരെ, തിങ്കൾ മുതൽ ശനി.

എന്തെങ്കിലും specific ആയി discuss ചെയ്യാനുണ്ടോ? ഞാൻ help ചെയ്യാം!`,

            manglish: `Namude Principal Dr. Mohammad Shekoor T aanu. PhD undu. Office Administrative Block il first floor il aanu.

Kaananam enkil, office time 10 AM to 5 PM, Monday to Saturday.

Enthenkkilum specific aayi discuss cheyyanundo? Njan help cheyyam!`
        },

        events: {
            en: `We have some really fun events here!

The biggest one is Asthra - our annual technical festival, usually held in February or March. It has lots of competitions and workshops.

Then there's Dhwani - the cultural fest in March with music, dance, and arts.

We also have Sports Day in January.

Are you interested in participating in any of these? I can tell you more about the events!`,

            ml: `ഞങ്ങൾക്ക് ചില രസകരമായ ഇവന്റുകൾ ഉണ്ട്!

ഏറ്റവും വലുത് Asthra - ഞങ്ങളുടെ annual technical fest, February അല്ലെങ്കിൽ March ൽ. competitions ഉം workshops ഉം ഉണ്ടാകും.

Dhwani - cultural fest, March ൽ. Music, dance, arts.

Sports Day January ൽ.

ഏതെങ്കിലും ഇവന്റിൽ participate ചെയ്യാൻ interest ഉണ്ടോ?`,

            manglish: `Namukku ചില fun events undu!

Etravum valuthu Asthra aanu - namude annual technical fest, February allenkil March il. Competitions um workshops um undaakum.

Dhwani - cultural fest, March il. Music, dance, arts ellam.

Sports Day January il.

Ethenkilum event il participate cheyan interest undo?`
        }
    };

    const response = responses[category];
    if (response) {
        return response[language] || response['en'];
    }
    return '';
}

// Detect category from query
function detectCategory(query: string): string | null {
    const queryLower = query.toLowerCase();

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(k => queryLower.includes(k))) {
            return category;
        }
    }

    return null;
}

// Search campus locations - now uses new locations.ts with verified Google Maps links
function searchLocations(query: string): CampusLocation | null {
    return findLocation(query);
}

// Search Q&A Database for matching patterns - generates NATURAL responses, not key-value dumps
function searchQADatabase(query: string, language: Language): SearchResult | null {
    const queryLower = query.toLowerCase();

    for (const entry of qaDatabase) {
        // Check if query matches any pattern
        for (const pattern of entry.question_patterns) {
            if (queryLower.includes(pattern.toLowerCase()) || pattern.toLowerCase().includes(queryLower)) {
                const facts = entry.answer_facts;

                // Handle special Response arrays (for greetings, thanks, etc.)
                if (facts.Response && Array.isArray(facts.Response)) {
                    const responses = facts.Response as string[];
                    const response = language === 'ml'
                        ? responses.find(r => /[\u0D00-\u0D7F]/.test(r)) || responses[0]
                        : responses[0];
                    return {
                        content: response,
                        category: entry.tags[0] || 'general',
                        confidence: 0.95,
                        source: 'qa_database'
                    };
                }

                // Generate NATURAL response based on what was asked - not key-value dump
                // Extract the most relevant fact based on the query
                const factEntries = Object.entries(facts);

                // For simple questions like "principal name", only return the specific answer
                if (queryLower.includes('name') && facts.Name) {
                    return {
                        content: `${facts.Name}`,
                        category: entry.tags[0] || 'general',
                        confidence: 0.95,
                        source: 'qa_database'
                    };
                }
                if (queryLower.includes('phone') || queryLower.includes('number') || queryLower.includes('call')) {
                    const phone = facts.Phone || facts['Phone'];
                    if (phone) {
                        return {
                            content: `${phone}`,
                            category: entry.tags[0] || 'general',
                            confidence: 0.95,
                            source: 'qa_database'
                        };
                    }
                }
                if (queryLower.includes('email')) {
                    const email = facts.Email || facts['Email'];
                    if (email) {
                        return {
                            content: `${email}`,
                            category: entry.tags[0] || 'general',
                            confidence: 0.95,
                            source: 'qa_database'
                        };
                    }
                }

                // For broader questions, return just the first/main fact naturally
                if (factEntries.length > 0) {
                    const [_firstKey, firstValue] = factEntries[0];
                    if (typeof firstValue === 'string') {
                        return {
                            content: firstValue,
                            category: entry.tags[0] || 'general',
                            confidence: 0.85,
                            source: 'qa_database'
                        };
                    }
                }
            }
        }

        // Also check tags
        for (const tag of entry.tags) {
            if (queryLower.includes(tag.toLowerCase())) {
                const facts = entry.answer_facts;
                if (facts.Response && Array.isArray(facts.Response)) {
                    const responses = facts.Response as string[];
                    return {
                        content: responses[0],
                        category: tag,
                        confidence: 0.8,
                        source: 'qa_database'
                    };
                }

                // Return first fact value only, not all
                const factEntries = Object.entries(facts);
                if (factEntries.length > 0) {
                    const [, firstValue] = factEntries[0];
                    if (typeof firstValue === 'string') {
                        return {
                            content: firstValue,
                            category: tag,
                            confidence: 0.75,
                            source: 'qa_database'
                        };
                    }
                }
            }
        }
    }

    return null;
}

// Main search function
export function searchKnowledgeBase(query: string, language: Language = 'en'): SearchResult {
    // Check for greetings
    const greetingPatterns = ['hi', 'hello', 'hey', 'namaste', 'good morning', 'good afternoon', 'good evening'];
    if (greetingPatterns.some(g => query.toLowerCase().startsWith(g) || query.toLowerCase() === g)) {
        return {
            content: getTimeBasedGreeting(),
            category: 'greeting',
            confidence: 1.0,
            source: 'faq'
        };
    }

    // PRIORITY 1: Search Q&A Database (has comprehensive patterns in English and Malayalam)
    const qaResult = searchQADatabase(query, language);
    if (qaResult && qaResult.confidence > 0.7) {
        return {
            ...qaResult,
            content: humanizeResponse(qaResult.content, false)
        };
    }

    // PRIORITY 2: Search campus locations FIRST (verified Google Maps links)
    // This ensures location queries like "Where is the library?" get maps links
    const locationQuery = query.toLowerCase().replace(/where is|how to reach|navigate to|find|the/g, '').trim();
    if (locationQuery.length > 2 || isLocationQuery(query)) {
        const location = searchLocations(query);
        if (location) {
            return {
                content: humanizeResponse(`${location.name} is located on campus. ${location.description}${location.timings ? `\n⏰ Timing: ${location.timings}` : ''}\n\n🗺️ Google Maps: ${location.mapsUrl}`),
                category: 'location',
                confidence: 0.9,
                source: 'location'
            };
        }
    }

    // PRIORITY 3: Detect category for queries with clear category keywords
    const category = detectCategory(query);
    if (category && category !== 'location') { // Skip 'location' category - handled above
        const response = getCategoryResponse(category, language);
        if (response) {
            return {
                content: humanizeResponse(response, false),
                category,
                confidence: 0.85,
                source: 'category'
            };
        }
    }

    // Search FAQs for more specific questions
    const faqResult = searchFAQs(query, language);
    if (faqResult && faqResult.confidence > 0.6) {
        return {
            ...faqResult,
            content: humanizeResponse(faqResult.content, false)
        };
    }

    // If FAQ result with lower confidence, still return it
    if (faqResult) {
        return {
            ...faqResult,
            content: humanizeResponse(faqResult.content, false)
        };
    }

    // Fallback response
    return {
        content: getRandomElement(knowledgeBase.humanResponses.notFound),
        category: 'unknown',
        confidence: 0,
        source: 'faq'
    };
}

// Export knowledge base data for direct access
export { knowledgeBase };
export { getTimeBasedGreeting, humanizeResponse, getRandomElement };
