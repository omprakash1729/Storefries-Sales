const raw = `04/05/2026	KIMS (Krishna Institute)	Bhuvaneshwari	Today he has appointment, so follow up after 12pm tom. to check for demo
04/05/2026	Soch Apparels	Bhuvaneshwari	Call after some time 
04/05/2026	Alldone Laundromat & Dry Cleaning	Om Prakash	Need to follow back on thursday
04/05/2026	Dhobilite Laundry	Om Prakash	Not interested
04/05/2026	Landmark Cars	Om Prakash	Abhishek Iyer Head Of Marketing Communications - He said they have enough man power , but he might convert if we pitch again 
04/05/2026	Nandhi Toyota	Om Prakash	Sri Harsha Vijayakumar - CORPORATE SALES TERRITORY HEAD - They asked for our website  , they will get back to us within 2 or 3 weeks 
05/06/2026	Kauvery Hospital	Bhuvaneshwari	Follow up
05/05/2026	Khazana Jewellery	Bhuvaneshwari	Shared pitch deck through mail id, follow up after 2 days (they already have  tools for all the activities)
05/05/2026	TTK prestige	Bhuvaneshwari	Make a follow up call after demo - Did not pick the call
05/05/2026	Popees	Bhuvaneshwari	He is in a meeting, call back later
05/05/2026	Trident Auto	Om Prakash	Not Interested
05/05/2026	Ola Electric 	Om Prakash	Not Interested
05/05/2026	Ather Space	Om Prakash	Not Interested
05/05/2026	Technosport	Bhuvaneshwari	He tried our product through our website, they did not like our dashboard
05/05/2026	Kims (Krishna Institute)	Bhuvaneshwari	Since there were issues in connecting could not conduct the demo meeting.
05/05/2026	Hatti Kaapi	Bhuvaneshwari	Follow Up Made
06/05/2026	TTK prestige	Bhuvaneshwari	Sent Follow up email. (Mr Abhishek has requested to continue any further discussion through mail only)
06/05/2026	KAG	Bhuvaneshwari	Sent mail to info@kagindia.com as per their suggestion. 
06/05/2026	KIMS (Krishna Institute)	Bhuvaneshwari	Follow Up Made, He had asked me to call tom after 11 AM
06/05/2026	RMKV Silks	Bhuvaneshwari	Call back on tuesday after texting on WA
06/05/2026	Nalli Silks	Bhuvaneshwari	Not required right now but shared the deck through mail
06/05/2026	Chennai Silks	Bhuvaneshwari	Not a right contact
06/05/2026	ABFRL	Bhuvaneshwari	Call back on wednesday 13/05 after 2 pm
07/05/2026	Joy Alukkas	Bhuvaneshwari	Shared deck through WA
07/05/2026	Kankatala Textiles	Bhuvaneshwari	Call after 6 pm
07/05/2026	KIMS (Krishna Institute)	Bhuvaneshwari	Demo Completed, need to share proposal
07/05/2026	Big A Solutions	Bhuvaneshwari	call back after 2 days
07/05/2026	Jayalakshmi Textiles	Bhuvaneshwari	Did not pick the call
07/05/2026	Neerus	Bhuvaneshwari	Not Reachable
08/05/2026	KIMS (Krishna Institute)	Bhuvaneshwari	Shared the proposal via mail
08/05/2026	Soch Apparels	Bhuvaneshwari	Sent follow up message through WA
08/05/2026	ttk prestige	Bhuvaneshwari	sent 2nd follow up mail
08/05/2026	popees	Bhuvaneshwari	follow up email sent
08/05/2026	TVS Motor Dealer Network	Bhuvaneshwari	Not Interested, They are using another platform so not needed now.
08/05/2026	Kalyani Motors	Bhuvaneshwari	Sent pitchdeck through WA
08/05/2026	Advaith hyundai	Bhuvaneshwari	Did not pick the call
08/05/2026	Bimal Auto Agency	Bhuvaneshwari	Person not working there, not picked the call
08/05/2026	Deepsense Digital 	Bhuvaneshwari	Shared pitchdeck with co founder
08/05/2026	Adinn Adv Service	Bhuvaneshwari	After May 16
08/05/2026	Polar Bear	Bhuvaneshwari	He said to give him a week time
08/05/2026	Arvind Fashion Limited	Bhuvaneshwari	Sent WA Reminder 
08/05/2026	snitch	Bhuvaneshwari	shared deck through WA
11/05/2026	Rainbow 	Bhuvaneshwari	Attended but no response
11/05/2026	Deepsense Digital 	Bhuvaneshwari	Sent WA Reminder`;

function inferStatus(rem) {
  const r = rem.toLowerCase();
  if (r.includes("not interested") || r.includes("not liked") || r.includes("did not like")) return "rejected";
  if (r.includes("shared the proposal") || r.includes("sent proposal")) return "proposal_sent";
  if (r.includes("demo completed")) return "demo";
  if (r.includes("follow up") || r.includes("shared deck") || r.includes("call back") || r.includes("sent mail")) return "prospect";
  return "new_lead";
}

function inferIndustry(name) {
  const n = name.toLowerCase();
  if (n.includes("hospital") || n.includes("institute") || n.includes("medical") || n.includes("kims")) return "Healthcare";
  if (n.includes("motors") || n.includes("cars") || n.includes("auto") || n.includes("electric") || n.includes("toyota") || n.includes("space") || n.includes("hyundai")) return "Automotive";
  if (n.includes("jewell") || n.includes("khazana") || n.includes("joy alukkas")) return "Jewellery";
  if (n.includes("apparels") || n.includes("textiles") || n.includes("silks") || n.includes("fashion") || n.includes("snitch") || n.includes("technosport") || n.includes("abfrl")) return "Apparel & Footwear";
  if (n.includes("dry cleaning") || n.includes("laundry")) return "Laundromat";
  if (n.includes("kaapi") || n.includes("bear") || n.includes("popees") || n.includes("prestige")) return "Food & Beverage";
  if (n.includes("digital") || n.includes("solutions") || n.includes("adv service")) return "Digital Marketing";
  return "Other";
}

const out = raw.split("\n").map((line, idx) => {
  const parts = line.split("\t").map(p => p.trim());
  const dateStr = parts[0]; // DD/MM/YYYY
  const company = parts[1];
  const owner = parts[2];
  const remark = parts[3] || "";

  const [d, m, y] = dateStr.split("/");
  const dateObj = new Date(`${y}-${m}-${d}T12:00:00.000Z`);
  
  const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthLabel = `${monthNames[dateObj.getUTCMonth()]} ${dateObj.getUTCFullYear()}`;

  return {
    id: `imported-${idx + 1000}-${Date.now()}`,
    name: company,
    owner: owner,
    industry: inferIndustry(company),
    month: monthLabel,
    status: inferStatus(remark),
    reason: remark || undefined,
    createdAt: dateObj.toISOString()
  };
});

console.log(JSON.stringify(out, null, 2));
