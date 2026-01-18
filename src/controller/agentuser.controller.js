import { AgentUserService } from "../services/agentuser.service.js";

export class AgentUserController {
    constructor() {
        this.agentUserService = new AgentUserService();
    }

    assignUser = async (req, res) => {
        try {
            const admin = req.admin;

            if (admin.role !== 'admin') {
                return res.status(403).json({ error: 'Only admin can assign users to agents' });
            }

            const { userId, agentId } = req.body;

            if (!userId || !agentId) {
                const errors = [];
                if (!userId) errors.push({ field: "userId", message: "User ID is required" });
                if (!agentId) errors.push({ field: "agentId", message: "Agent ID is required" });
                return res.status(400).json({ message: 'Both userId and agentId are required', errors });
            }

            const assignment = await this.agentUserService.assignUser(userId, agentId);
            res.status(201).json(assignment);

        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to assign user to agent', message: error.message });
        }
    }

    unAssingnUser = async (req, res) => {
        try {
            const admin = req.admin;
            if (admin.role !== 'admin') {
                return res.status(403).json({ error: 'Only admin can unassign users from agents' });
            }
            const { userId, agentId } = req.body;
            if (!userId || !agentId) {
                const errors = [];
                if (!userId) errors.push({ field: "userId", message: "User ID is required" });
                if (!agentId) errors.push({ field: "agentId", message: "Agent ID is required" });
                return res.status(400).json({ message: 'Both userId and agentId are required', errors });
            }
            const result = await this.agentUserService.unAssignUser({ userId, agentId });
            res.status(200).json(result);
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to unassign user from agent', message: error.message });
        }
    }

    getAgentUsers = async (req, res) => {
        try {
            const admin = req.admin;
            const { agentId } = req.params;

            if (admin.role !== 'admin') {
                return res.status(403).json({ error: 'Access denied' });
            }

            const assignedUser = await this.agentUserService.getUsersByAgentId(agentId);
            const agent = assignedUser.length > 0 ? assignedUser[0]?.agent : null;
            assignedUser.forEach(au => { delete au?.agent; });
            res.status(200).json({  agent , assignedUser });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch agent-user assignments', message: error.message });
        }
    }
}