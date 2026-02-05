<!-- @format -->

# Strapi :raised_hand:

Strapi is an opensource Node.js headless CMS.

### :star2: Contents

We are using collection type to create pages from strapi. Each page have path field. Our custom API end point will deliver formatted data to front end based on those paths.

### :star2: Common Data's

Common data's like header, footer etc will deliver from a single type content.

### :star2: Components

Component will be created by strapi built-in component type.

#### Steps to create components:

- Decide the content that needs to deliver to front end
- Create a component type based on this content
- Attach this component to dynamic component field of collection type.
- Define a new service using yarn strapi generate command
- Add this service to cms/components/component-name.json file
- Update your service file under api/{project-folder}/services folder like below

```typescript jsx
export default {
	renderComponent: async (
		component: HeaderTextRequest,
		id: number,
		params: object,
	): Promise<HeaderTextResponse> => {
		const headerData = await strapi
			.query('header.c1')
			.findOne({ where: { id: component.id }, populate: true });
		// @ts-ignore
		const logo: ImageData = strapi
			.service('api::content.field-render')
			.getImage(headerData.image);
		return { title: component.title, logo: logo };
	},
};
```

That's it. You can add this component when you create a page from admin panel.

#### How to get this component to other developers

- make app-back-config-export
- git add, commit, push
- git pull
- make app-back-config-import

#### Good practice to create components :pray:

- Component can be nested. Only first level components should attach with content type. Others should be attached to main component.
- Please use a short name for components. Eg: C1, C2 etc.
- You can configure view mode with actual name of components. Eg: `[C1] Standard Text`
- Reusable components should be created under common group.
