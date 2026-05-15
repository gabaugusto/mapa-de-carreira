/*
	Versao orientada por JSON.

	Este arquivo mostra uma separacao comum em projetos reais:
	- dados editaveis ficam no JSON;
	- estrutura fica no HTML;
	- montagem dinamica fica no JavaScript.
*/

const DATA_URL = "assets/data/carreira.json";

const createElement = (tagName, className, textContent) => {
	const element = document.createElement(tagName);

	if (className) {
		element.className = className;
	}

	if (textContent) {
		element.textContent = textContent;
	}

	return element;
};

const createBadgeList = (items, ariaLabel) => {
	const list = createElement("ul", "list-inline");
	list.setAttribute("aria-label", ariaLabel);

	items.forEach((item) => {
		const listItem = createElement("li", "list-inline-item");
		const badge = createElement("span", "badge bg-secondary badge-pill", item);

		listItem.appendChild(badge);
		list.appendChild(listItem);
	});

	return list;
};

const renderHeadMetadata = ({ seo, profile }) => {
	document.title = seo.title;
	document.querySelector('meta[name="description"]').setAttribute("content", seo.description);

	const author = document.createElement("meta");
	author.name = "author";
	author.content = seo.author;
	document.head.appendChild(author);

	const canonical = document.createElement("link");
	canonical.rel = "canonical";
	canonical.href = seo.canonicalUrl;
	document.head.appendChild(canonical);

	const openGraphTitle = document.createElement("meta");
	openGraphTitle.setAttribute("property", "og:title");
	openGraphTitle.content = seo.title;
	document.head.appendChild(openGraphTitle);

	const openGraphDescription = document.createElement("meta");
	openGraphDescription.setAttribute("property", "og:description");
	openGraphDescription.content = seo.description;
	document.head.appendChild(openGraphDescription);

	const openGraphImage = document.createElement("meta");
	openGraphImage.setAttribute("property", "og:image");
	openGraphImage.content = profile.photo;
	document.head.appendChild(openGraphImage);
};

const renderProfile = ({ profile, contacts }) => {
	document.getElementById("profile-name").textContent = profile.name;
	document.getElementById("profile-headline").textContent = profile.headline;
	document.getElementById("profile-summary").textContent = profile.summary;

	const photo = document.getElementById("profile-photo");
	photo.src = profile.photo;
	photo.alt = profile.photoAlt;

	const cvLink = document.getElementById("cv-link");
	cvLink.href = profile.cvUrl;
	cvLink.setAttribute("aria-label", `Baixar curriculo de ${profile.name} em PDF`);

	const contactList = document.getElementById("contact-list");
	contactList.innerHTML = "";

	contacts.forEach((contact) => {
		const listItem = createElement("li", "mb-2");
		const link = createElement("a", "text-link", contact.label);
		link.href = contact.url;

		if (contact.url.startsWith("http")) {
			link.target = "_blank";
			link.rel = "noopener";
		}

		listItem.appendChild(link);
		contactList.appendChild(listItem);
	});
};

const renderCareerTimeline = (careerSteps) => {
	const timeline = document.getElementById("career-timeline");
	timeline.innerHTML = "";

	careerSteps.forEach((step, index) => {
		const article = createElement("article", "resume-timeline-item position-relative pb-5");
		const titleId = `career-step-${index + 1}`;
		article.setAttribute("aria-labelledby", titleId);

		const header = createElement("div", "resume-timeline-item-header mb-2");
		const title = createElement("h3", "resume-position-title font-weight-bold mb-1", step.title);
		title.id = titleId;
		header.appendChild(title);

		const description = createElement("div", "resume-timeline-item-desc");
		description.appendChild(createElement("p", "", step.description));

		description.appendChild(createElement("h4", "resume-timeline-item-desc-heading font-weight-bold", "Soft skills exigidas para essa etapa"));

		const softSkillList = createElement("ul");
		step.softSkills.forEach((skill) => {
			softSkillList.appendChild(createElement("li", "", skill));
		});
		description.appendChild(softSkillList);

		description.appendChild(createElement("h4", "resume-timeline-item-desc-heading font-weight-bold", "Roadmap de aprendizado"));
		description.appendChild(createBadgeList(step.roadmap, `Tecnologias da etapa ${step.title}`));

		article.appendChild(header);
		article.appendChild(description);
		timeline.appendChild(article);
	});
};

const renderSkills = ({ skillGroups, otherSkills }) => {
	const skillGroupsContainer = document.getElementById("skill-groups");
	skillGroupsContainer.innerHTML = "";

	skillGroups.forEach((group) => {
		const groupElement = createElement("div", "resume-skill-item");
		groupElement.appendChild(createElement("h3", "resume-skills-cat font-weight-bold h5", group.title));

		const list = createElement("ul", "list-unstyled mb-4");

		group.skills.forEach((skill) => {
			const item = createElement("li", "mb-2");
			item.appendChild(createElement("div", "resume-skill-name", skill.name));

			const progress = createElement("div", "progress resume-progress");
			progress.setAttribute("aria-label", `${skill.name}: ${skill.level}%`);

			const bar = createElement("div", "progress-bar theme-progress-bar-dark");
			bar.setAttribute("role", "progressbar");
			bar.setAttribute("aria-valuemin", "0");
			bar.setAttribute("aria-valuemax", "100");
			bar.setAttribute("aria-valuenow", String(skill.level));
			bar.style.width = `${skill.level}%`;

			progress.appendChild(bar);
			item.appendChild(progress);
			list.appendChild(item);
		});

		groupElement.appendChild(list);
		skillGroupsContainer.appendChild(groupElement);
	});

	const otherSkillsList = document.getElementById("other-skills");
	otherSkillsList.innerHTML = "";

	otherSkills.forEach((skill) => {
		const item = createElement("li", "list-inline-item");
		item.appendChild(createElement("span", "badge badge-light", skill));
		otherSkillsList.appendChild(item);
	});
};

const renderLanguages = (languages) => {
	const languageList = document.getElementById("language-list");
	languageList.innerHTML = "";

	languages.forEach((language) => {
		const item = createElement("li", "mb-2");
		item.appendChild(createElement("strong", "", language.name));
		item.append(" ");
		item.appendChild(createElement("span", "text-muted", `(${language.level})`));
		languageList.appendChild(item);
	});
};

const renderPage = (data) => {
	renderHeadMetadata(data);
	renderProfile(data);
	renderCareerTimeline(data.careerSteps);
	renderSkills(data);
	renderLanguages(data.languages);
};

fetch(DATA_URL)
	.then((response) => {
		if (!response.ok) {
			throw new Error("Nao foi possivel carregar o JSON.");
		}

		return response.json();
	})
	.then(renderPage)
	.catch((error) => {
		const main = document.getElementById("conteudo-principal");
		const warning = createElement("p", "alert alert-warning m-5", "Nao foi possivel carregar os dados do JSON. Execute a pagina em um servidor local ou publique no GitHub Pages.");
		main.prepend(warning);
		console.error(error);
	});
