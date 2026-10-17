export type Json =
	| string
	| number
	| boolean
	| null
	| { [key: string]: Json | undefined }
	| Json[];

export type Database = {
	graphql_public: {
		Tables: {
			[_ in never]: never;
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			graphql: {
				Args: {
					extensions?: Json;
					operationName?: string;
					query?: string;
					variables?: Json;
				};
				Returns: Json;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
	public: {
		Tables: {
			categorias: {
				Row: {
					ativo: boolean;
					criado_em: string;
					id: string;
					link_vitrine: string | null;
					nome: string;
					ordem: number;
					parent_id: string | null;
					slug: string;
					vitrine: boolean;
				};
				ComputedFields: never;
				Insert: {
					ativo?: boolean;
					criado_em?: string;
					id?: string;
					link_vitrine?: string | null;
					nome: string;
					ordem?: number;
					parent_id?: string | null;
					slug: string;
					vitrine?: boolean;
				};
				Update: {
					ativo?: boolean;
					criado_em?: string;
					id?: string;
					link_vitrine?: string | null;
					nome?: string;
					ordem?: number;
					parent_id?: string | null;
					slug?: string;
					vitrine?: boolean;
				};
				Relationships: [
					{
						foreignKeyName: "categorias_parent_id_fkey";
						columns: ["parent_id"];
						isOneToOne: false;
						referencedRelation: "categorias";
						referencedColumns: ["id"];
					},
				];
			};
			perfis: {
				Row: {
					bairro: string | null;
					cep: string | null;
					cidade: string | null;
					complemento: string | null;
					criado_em: string;
					id: string;
					logradouro: string | null;
					nome: string | null;
					numero: string | null;
					papel: string;
					telefone: string | null;
					uf: string | null;
				};
				ComputedFields: never;
				Insert: {
					bairro?: string | null;
					cep?: string | null;
					cidade?: string | null;
					complemento?: string | null;
					criado_em?: string;
					id: string;
					logradouro?: string | null;
					nome?: string | null;
					numero?: string | null;
					papel?: string;
					telefone?: string | null;
					uf?: string | null;
				};
				Update: {
					bairro?: string | null;
					cep?: string | null;
					cidade?: string | null;
					complemento?: string | null;
					criado_em?: string;
					id?: string;
					logradouro?: string | null;
					nome?: string | null;
					numero?: string | null;
					papel?: string;
					telefone?: string | null;
					uf?: string | null;
				};
				Relationships: [];
			};
			produto_fotos: {
				Row: {
					alt: string;
					id: string;
					ordem: number;
					path_grande: string;
					path_miniatura: string;
					produto_id: string;
				};
				ComputedFields: never;
				Insert: {
					alt?: string;
					id?: string;
					ordem?: number;
					path_grande: string;
					path_miniatura: string;
					produto_id: string;
				};
				Update: {
					alt?: string;
					id?: string;
					ordem?: number;
					path_grande?: string;
					path_miniatura?: string;
					produto_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "produto_fotos_produto_id_fkey";
						columns: ["produto_id"];
						isOneToOne: false;
						referencedRelation: "produtos";
						referencedColumns: ["id"];
					},
				];
			};
			produtos: {
				Row: {
					ativo: boolean;
					categoria_id: string;
					criado_em: string;
					descricao: string;
					destaque: boolean;
					id: string;
					marca: string | null;
					nome: string;
					slug: string;
				};
				ComputedFields: never;
				Insert: {
					ativo?: boolean;
					categoria_id: string;
					criado_em?: string;
					descricao?: string;
					destaque?: boolean;
					id?: string;
					marca?: string | null;
					nome: string;
					slug: string;
				};
				Update: {
					ativo?: boolean;
					categoria_id?: string;
					criado_em?: string;
					descricao?: string;
					destaque?: boolean;
					id?: string;
					marca?: string | null;
					nome?: string;
					slug?: string;
				};
				Relationships: [
					{
						foreignKeyName: "produtos_categoria_id_fkey";
						columns: ["categoria_id"];
						isOneToOne: false;
						referencedRelation: "categorias";
						referencedColumns: ["id"];
					},
				];
			};
			variantes: {
				Row: {
					ativo: boolean;
					cor: string | null;
					estoque: number;
					id: string;
					preco_centavos: number;
					produto_id: string;
					tamanho: string | null;
				};
				ComputedFields: never;
				Insert: {
					ativo?: boolean;
					cor?: string | null;
					estoque?: number;
					id?: string;
					preco_centavos: number;
					produto_id: string;
					tamanho?: string | null;
				};
				Update: {
					ativo?: boolean;
					cor?: string | null;
					estoque?: number;
					id?: string;
					preco_centavos?: number;
					produto_id?: string;
					tamanho?: string | null;
				};
				Relationships: [
					{
						foreignKeyName: "variantes_produto_id_fkey";
						columns: ["produto_id"];
						isOneToOne: false;
						referencedRelation: "produtos";
						referencedColumns: ["id"];
					},
				];
			};
			zonas_frete: {
				Row: {
					ativo: boolean;
					cep_fim: string;
					cep_inicio: string;
					criado_em: string;
					id: string;
					nome: string;
					preco_centavos: number | null;
				};
				ComputedFields: never;
				Insert: {
					ativo?: boolean;
					cep_fim: string;
					cep_inicio: string;
					criado_em?: string;
					id?: string;
					nome: string;
					preco_centavos?: number | null;
				};
				Update: {
					ativo?: boolean;
					cep_fim?: string;
					cep_inicio?: string;
					criado_em?: string;
					id?: string;
					nome?: string;
					preco_centavos?: number | null;
				};
				Relationships: [];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			ajustar_estoque: {
				Args: { delta: number; variante: string };
				Returns: number;
			};
			categoria_vitrine: { Args: { categoria: string }; Returns: boolean };
			health: { Args: Record<PropertyKey, never>; Returns: boolean };
			is_admin: { Args: Record<PropertyKey, never>; Returns: boolean };
			salvar_produto: { Args: { dados: Json }; Returns: string };
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
	keyof Database,
	"public"
>];

export type Tables<
	DefaultSchemaTableNameOrOptions extends
		| keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
				DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
			DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
		}
		? R
		: never
	: DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
				DefaultSchema["Views"])
		? (DefaultSchema["Tables"] &
				DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
				Row: infer R;
			}
			? R
			: never
		: never;

export type TablesInsert<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
		}
		? I
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Insert: infer I;
			}
			? I
			: never
		: never;

export type TablesUpdate<
	DefaultSchemaTableNameOrOptions extends
		| keyof DefaultSchema["Tables"]
		| { schema: keyof DatabaseWithoutInternals },
	TableName extends DefaultSchemaTableNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
		: never = never,
> = DefaultSchemaTableNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
		}
		? U
		: never
	: DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
		? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
				Update: infer U;
			}
			? U
			: never
		: never;

export type Enums<
	DefaultSchemaEnumNameOrOptions extends
		| keyof DefaultSchema["Enums"]
		| { schema: keyof DatabaseWithoutInternals },
	EnumName extends DefaultSchemaEnumNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
		: never = never,
> = DefaultSchemaEnumNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
		? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
		: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends
		| keyof DefaultSchema["CompositeTypes"]
		| { schema: keyof DatabaseWithoutInternals },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof DatabaseWithoutInternals;
	}
		? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends {
	schema: keyof DatabaseWithoutInternals;
}
	? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
		? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
		: never;

export const Constants = {
	graphql_public: {
		Enums: {},
	},
	public: {
		Enums: {},
	},
} as const;
