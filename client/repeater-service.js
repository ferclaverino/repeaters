export class RepeaterService {
  async getAll() {
    const response = await fetch("api/repeaters");
    return response.json();
  }
}
