const puppeteer = require("puppeteer");
const fs = require("fs");

const init = async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto("https://ipm.ucanr.edu/PMG/diseases/diseaseslist.html");
  const diseasesTable = await page.$("#ALLDISEASES");

  const diseasesRows = await diseasesTable.$$("tr");
  const rowsData = [];

  for (const diseaseRow of diseasesRows) {
    const columns = await diseaseRow.$$("td");
    const rowData = [];
    for (const column of columns) {
      const node = {};
      const anchor = await column.$("a");
      const columnData = await page.evaluate((el) => el.textContent, column);
      node.text = columnData.trim();

      if (anchor) {
        const anchorHref = await anchor.getProperty("href");
        node.anchor = await anchorHref.jsonValue();
      }
      rowData.push(node);
    }

    rowsData.push(rowData);
  }

  await page.close();

  const knowledgeBase = [];

  for (const data of rowsData) {
    if (data.length > 0) {
      const [plant, commonName, scientificName, type] = data;
      const page2 = await browser.newPage();
      try {
        await page2.goto(commonName.anchor);
        const symptom = await page2.$$eval("p", (paragraphs) => {
          for (let i = 0; i < paragraphs.length; i++) {
            const bTag = paragraphs[i].querySelector("b");
            if (bTag && bTag.textContent.toLowerCase().includes("symptoms")) {
              const nextParagraph = paragraphs[i].nextElementSibling;
              if (nextParagraph && nextParagraph.tagName === "P") {
                return nextParagraph.textContent.replace(/\s{2,}/g, " ").trim();
              }
            }
          }
          return null;
        });

        const treatment = await page2.$$eval("p", (paragraphs) => {
          for (let i = 0; i < paragraphs.length; i++) {
            const bTag = paragraphs[i].querySelector("b");
            if (
              bTag &&
              bTag.textContent
                .toLowerCase()
                .includes("prevention and management")
            ) {
              const nextParagraph = paragraphs[i].nextElementSibling;
              if (nextParagraph && nextParagraph.tagName === "P") {
                return nextParagraph.textContent.replace(/\s{2,}/g, " ").trim();
              }
            }
          }
          return null;
        });

        if (symptom && treatment) {
          knowledgeBase.push({
            symptom,
            treatment,
            type: type.text,
            scientificName: scientificName.text,
            commonName: commonName.text,
            plant: plant.text,
          });
        }
      } catch (error) {
        console.log("error reading plant: ", plant.text);
      }

      await page2.close();
    }
  }

  fs.writeFile(
    "knowledge-base.json",
    JSON.stringify(knowledgeBase, null, 2),
    (err) => {
      if (err) {
        console.log(err);
      }
    }
  );

  await browser.close();
};

init();
