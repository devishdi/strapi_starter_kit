import {
    AgentRequest,
    AgentResponse,
} from '../../../../types/custom/common-type';

export default {
    getAgent: ({
        id,
        name,
        image,
        location,
        clients,
        description,
    }: AgentRequest): AgentResponse => {
        const agentImage = strapi
            .service('api::content.field-render')
            .getImage(image);

        return { name, image: agentImage, location, clients, description };
    },
    getAgents: (agentData: AgentRequest[]): AgentResponse[] => {
        return agentData.map((agent: AgentRequest): AgentResponse => {
            return strapi.service('api::content.agent').getAgent(agent);
        });
    },
};
