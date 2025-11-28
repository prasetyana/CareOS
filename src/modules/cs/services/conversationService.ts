/**
 * CS Conversation Service
 * Handles conversation management for customer service agents
 */

import { supabase } from '@core/supabase/supabase';
import { Conversation, Message } from '@core/data/mockDB';

/**
 * Get conversations for agent
 */
export async function getConversations(
    tenantId: string,
    agentId: string,
    filter?: 'all' | 'open' | 'assigned' | 'unassigned'
): Promise<Conversation[]> {
    // TODO: Implement actual Supabase query
    return [];
}

/**
 * Send a message in conversation
 */
export async function sendMessage(
    tenantId: string,
    conversationId: string,
    message: Partial<Message>
): Promise<Message> {
    // TODO: Implement actual Supabase query
    throw new Error('Not implemented');
}

/**
 * Assign conversation to agent
 */
export async function assignConversation(
    tenantId: string,
    conversationId: string,
    agentId: string
): Promise<Conversation> {
    // TODO: Implement actual Supabase query
    throw new Error('Not implemented');
}

/**
 * Close a conversation
 */
export async function closeConversation(
    tenantId: string,
    conversationId: string
): Promise<void> {
    // TODO: Implement actual Supabase query
}

/**
 * Reopen a conversation
 */
export async function reopenConversation(
    tenantId: string,
    conversationId: string
): Promise<Conversation> {
    // TODO: Implement actual Supabase query
    throw new Error('Not implemented');
}
